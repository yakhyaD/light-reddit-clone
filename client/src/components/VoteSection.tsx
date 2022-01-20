import { Flex, IconButton } from "@chakra-ui/react";
import {ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { PostInfosFragment, useVoteMutation } from "../generated/graphql"
import { useState } from "react";

interface VoteSectionProps {
    post: PostInfosFragment;
}

const VoteSection: React.FC<VoteSectionProps> = ({post}) => {
    const [loadingState, setLoadingState] = useState<"upvote-loading" | "downvote-loading" | "not-loading">("not-loading");
    const [,vote] = useVoteMutation();
    return (
        <Flex direction="column"
            alignItems="center"
            justifyContent="center"
            mr={3}
        >
            <IconButton aria-label="upvote"
                icon={<ChevronUpIcon />}
                colorScheme={post.voteStatus === 1 ? "green" : undefined}
                isLoading={loadingState === "upvote-loading"}
                onClick={async () => {
                    if(post.voteStatus === 1){
                        return;
                    }
                    setLoadingState("upvote-loading");
                    await vote({
                        value: 1,
                        postId: post.id
                    })
                    setLoadingState("not-loading");
                }}
            />
            {post.points}
            <IconButton
                aria-label="downvote"
                colorScheme={post.voteStatus === -1 ? "red" : undefined}
                icon={<ChevronDownIcon />}
                isLoading={loadingState === "downvote-loading"}
                onClick={async () => {
                    if(post.voteStatus === -1){
                        return;
                    }
                    setLoadingState("downvote-loading");
                    await vote({
                        value: -1,
                        postId: post.id
                    })
                    setLoadingState("not-loading");
                }}
            />
        </Flex>
    )
}

export default VoteSection

