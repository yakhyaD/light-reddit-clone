import { Vote } from "../entities/Vote";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { MyContext } from "../type";
import { User } from "../entities/User";

@InputType()
class PostInput {
    @Field()
    title: string;

    @Field()
    text: string;

}
@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field(() => Boolean)
    hasMore: boolean;
}


@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textTruncated(
        @Root() root: Post
    ) {
        return root.text.slice(0, 50)
    }

    @FieldResolver(() => User)
    author(
        @Root() post: Post,
        @Ctx() { userLoader }: MyContext
    ) {
        return userLoader.load(post.authorId);
    }
    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(
        @Root() post: Post,
        @Ctx() { voteLoader, req }: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }
        const vote = await voteLoader.load({
            postId: post.id,
            userId: req.session.userId
        });
        // console.log("voteLoader");
        return vote ? vote.value : null;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(limit, 50);
        const limitPlusOne = realLimit + 1;
        const replacement: any[] = [limitPlusOne];
        if (cursor) {
            replacement.push(new Date(cursor));
        }
        const posts = await getConnection().query(`
            SELECT p.*
            from post p
            ${cursor ? `where p."createdAt" < $2` : ""}
            order by p."createdAt" desc
            limit $1
        `, replacement
        )

        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === limitPlusOne
        }
    }

    @Query(() => Post)
    post(
        @Arg("id", () => Int) id: number
    ): Promise<Post | undefined> {
        return Post.findOne(id, { relations: ["author"] });
    }
    @Mutation(() => Post)
    @UseMiddleware(isAuthenticated)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        return Post.create({
            ...input,
            authorId: req.session.userId
        }).save();
    }
    @Mutation(() => Post, { nullable: true })
    //@UseMiddleware(isAuthenticated)
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String) title: string,
        @Arg("text", () => String) text: string,
        @Ctx() { req }: MyContext
    ): Promise<Post | null | undefined> {
        const post = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id and "authorId" = :authorId', {
                id: id,
                authorId: req.session.userId
            })
            .returning('*')
            .execute();
        return post as any;
    }
    @Mutation(() => Boolean)
    @UseMiddleware(isAuthenticated)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Boolean> {
        await Post.delete({ id, authorId: req.session.userId });
        return true;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuthenticated)
    async vote(
        @Arg("value", () => Int) value: number,
        @Arg("postId", () => Int) postId: number,
        @Ctx() { req }: MyContext
    ) {
        const { userId } = req.session;
        const isVote = value !== -1;
        const realValue = isVote ? 1 : -1;

        const res = await Vote.findOne({ where: { userId, postId } });

        // user already voted and wants to change his vote
        if (res && res.value !== realValue) {
            await getConnection().transaction(async transaction => {
                await transaction.query(`
                    update vote set
                    value = $1
                    where "userId" = $2 and "postId" = $3
                `, [realValue, userId, postId]
                );
                await transaction.query(`
                    update post set
                    points = (points + $1)
                    where id = $2;
                `, [2 * realValue, postId])
            })

        }
        // user has not voted yet
        else if (!res) {
            await getConnection().transaction(async transaction => {
                await transaction.query(`
                    insert into vote ("postId", "userId", value)
                    values($1, $2, $3)
                `, [postId, userId, realValue]
                );
                await transaction.query(`
                    update post set
                    points = (points + $1)
                    where id = $2;
                `, [realValue, postId]
                );
            })
        }
        return true;
    }
}
