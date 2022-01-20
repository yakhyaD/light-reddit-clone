import { Link, Stack, Box, Heading, Flex, Button, Text, IconButton } from "@chakra-ui/react"
import { withUrqlClient } from "next-urql"
import NextLink from "next/link"
import React, { useState } from "react"
import Layout from "../components/Layout"
import VoteSection from "../components/VoteSection"
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql"
import { CreateUrqlClient } from "../utils/createUrqlClient"
import Cookies from 'cookies'
import { DeleteIcon } from "@chakra-ui/icons"
import EditDeletePostComponent from "../components/EditDeletePostComponent"


const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as string | null,
  })
  const [{data, fetching}] = usePostsQuery({variables})


  if(!data && !fetching){
    return (
      <div>Query failed. Something went wrong</div>
    )
  }
  return (
    <Layout>
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts?.posts?.map((post) => (
            !post ? null : (
            <Flex key={post.id}  p={5} shadow="md" borderWidth="1px">
              <VoteSection post={post} />
              <Box flex={1}>
                <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                  <Link>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </Link>
                </NextLink>
                <Text>Posted by {post.author.username}</Text>
                <Flex  align="center">
                  <Text flex={1} mt={4}>{post.textTruncated}</Text>
                  <Box ml="auto">
                    <EditDeletePostComponent id={post.id} authorId={post.authorId} />
                  </Box>
                </Flex>
              </Box>
            </Flex>
          )))}
        </Stack>
      )}
      {data && data.posts.hasMore ?
      <Flex>
        <Button onClick={() => {
          setVariables({
            limit: variables.limit,
            cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
          })
        }}
          m="auto" my={8}
          isLoading={fetching}
        >
          Load more...
        </Button>
      </Flex>

      : null}
    </Layout>
  )
}

export default withUrqlClient(CreateUrqlClient, {ssr: true})(Index)

