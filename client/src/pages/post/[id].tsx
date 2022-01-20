import React from "react";
import { withUrqlClient } from "next-urql";
import { Heading, Box, Flex } from "@chakra-ui/react";
import { useRouter } from 'next/router';
import { usePostQuery } from "../../generated/graphql";
import { CreateUrqlClient } from "../../utils/createUrqlClient";
import Layout from "../../components/Layout";
import EditDeletePostComponent from "../../components/EditDeletePostComponent";

const Post = ({ }) => {
    const router = useRouter();
    const postId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
    const [{data, error, fetching}] = usePostQuery({
        pause: postId === -1,
        variables:{
            id: postId
        }
    });

    if(fetching){
        return (
            <Layout>
            <Box>Loading...</Box>
                </Layout>
        )
    }
    if (error) {
        return <div>{error.message}</div>;
    }

    if(!data?.post){
        return (
            <Layout>
                <Box>Post not founded</Box>
            </Layout>
        )
    }


    return (
        <Layout>
            <Flex direction="column">
                <Heading mb={4}>{data.post.title}</Heading>
                <Box mb={4}>{data.post.text}</Box>
                <Box>
                    <EditDeletePostComponent id={data.post.id} authorId={data.post.authorId}  />
                </Box>
            </Flex>
        </Layout>
    )
}
export default withUrqlClient(CreateUrqlClient, {ssr: true})(Post);
