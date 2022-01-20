import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
import NextLink from "next/link";

export interface EditDeletePostComponentProps {
    id: number;
    authorId: number;
}
const EditDeletePostComponent:React.FC<EditDeletePostComponentProps> = ({id, authorId}) => {
    const [{data}] = useMeQuery();
    const [, deletePost] = useDeletePostMutation()

    if(data?.me?.id !== authorId) {
        return null;
    }
    return (
        <>
            <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
                <IconButton
                    as={Link}
                    mr={4}
                    icon={<EditIcon />}
                    aria-label="Edit Post"
                    colorScheme="gray 50"
                />
            </NextLink>
            <IconButton aria-label="delete post"
                icon={<DeleteIcon />}
                colorScheme="red"
                onClick={() => {
                    if(!window.confirm("Do you want to delete this post?")){
                      return
                    }
                    deletePost({id});
                }}
            />
        </>
    )
}
export default EditDeletePostComponent
