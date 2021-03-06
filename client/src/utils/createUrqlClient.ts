import { Cache, cacheExchange, Resolver } from '@urql/exchange-graphcache';
import Router from "next/router";
import { dedupExchange, Exchange, fetchExchange, stringifyVariables } from "urql";
import { pipe, tap } from 'wonka';
import { DeletePostMutationVariables, LoginMutation, MeDocument, MeQuery, RegisterMutation, UpdatePostMutationVariables, VoteMutationVariables } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { gql } from '@urql/core';
import { isServer } from './isServer';


export type MergeMode = 'before' | 'after';

const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;

        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
        const isInTheCache = cache.resolveFieldByKey(
            cache.resolve(entityKey, fieldKey) as string,
            "posts"
        );
        info.partial = !isInTheCache;
        let results: string[] = [];
        let hasMore = true;
        try {
            fieldInfos.forEach(fieldInfo => {
                const key = cache.resolveFieldByKey(entityKey, fieldInfo.fieldKey) as string
                const data = cache.resolve(key, "posts") as string[];
                const _hasMore = cache.resolve(key, "hasMore");
                if (!_hasMore) {
                    hasMore = _hasMore as boolean;
                }
                results.push(...data);
            })
        } catch (e) {
            console.log(e);
        }
        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: results,
        };
    };
};

export const errorExchange: Exchange = ({ forward }) => ops$ => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            // If the OperationResult has an error send a request to sentry
            if (error?.message.includes("not authenticated")) {
                Router.replace('/login')
            }
        })
    );
};

const invalidateAllPosts = (cache: Cache) => {
    const allFields = cache.inspectFields("Query");
    const fieldInfos = allFields.filter(info => info.fieldName === "posts");
    fieldInfos.forEach(fieldInfo => {
        cache.invalidate("Query", "posts", fieldInfo.arguments || {});
    })
}


export const CreateUrqlClient = (ssrExchange: any, ctx: any) => {
    let cookie = ""
    if (isServer()) {
        cookie = ctx?.req?.headers?.cookie;
    }

    return {
        url: process.env.PUBLIC_API_URL as string,
        fetchOptions: {
            credentials: "include" as const,
            headers: cookie ? { cookie } : undefined,
        },
        exchanges: [
            dedupExchange,
            cacheExchange({
                keys: {
                    PaginatedPosts: () => null,
                },
                resolvers: {
                    Query: {
                        posts: cursorPagination(),
                    }
                },
                updates: {
                    Mutation: {
                        deletePost: (_result, args, cache, info) => {
                            cache.invalidate({
                                __typename: "Post",
                                id: (args as DeletePostMutationVariables).id
                            });
                        },
                        vote: (_result, args, cache, info) => {
                            const { postId, value } = args as VoteMutationVariables;
                            const data = cache.readFragment(
                                gql`
                                fragment _ on Post {
                                    id
                                    points
                                    voteStatus
                                }
                            `,
                                { id: postId } as any
                            );
                            if (data) {
                                if (data.voteStatus === value) {
                                    return;
                                }
                                const newPoints = (data.points as number) + ((!data.voteStatus ? 1 : 2) * value);
                                cache.writeFragment(
                                    gql`
                                    fragment __ on Post {
                                        points
                                        voteStatus
                                    }
                                `,
                                    { id: postId, points: newPoints, voteStatus: value } as any
                                );
                            }
                        },
                        createPost: (_result, args, cache, info) => {
                            invalidateAllPosts(cache);
                        },
                        logout: (_result, args, cache, info) => {
                            betterUpdateQuery<LoginMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                _result,
                                () => ({ me: null })
                            )
                        },
                        login: (_result, args, cache, info) => {
                            betterUpdateQuery<LoginMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                _result,
                                (result, query) => {
                                    if (result.login.errors) {
                                        return query
                                    } else {
                                        return {
                                            me: result.login.user
                                        }
                                    }
                                }
                            )
                            invalidateAllPosts(cache);
                        },
                        register: (_result, args, cache, info) => {
                            betterUpdateQuery<RegisterMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                _result,
                                (result, query) => {
                                    if (result.register.errors) {
                                        return query
                                    } else {
                                        return {
                                            me: result.register.user
                                        }
                                    }
                                }
                            )
                        }
                    }
                }
            }),
            ssrExchange,
            fetchExchange,
            errorExchange
        ]
    }
}
