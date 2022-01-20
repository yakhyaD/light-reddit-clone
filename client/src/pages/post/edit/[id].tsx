import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import { usePostQuery, useUpdatePostMutation } from "../../../generated/graphql";
import { CreateUrqlClient } from "../../../utils/createUrqlClient";

const EditPost = ({}) => {
    const router = useRouter();
    const postId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

    const [{data, fetching}] = usePostQuery({
        pause: postId === -1,
        variables:{
            id: postId
        }
    });
    const [, updatePost] = useUpdatePostMutation()

    if(fetching){
        return (
            <Layout>
                <Box>Loading...</Box>
            </Layout>
        )
    }
    if (!data?.post) {
        return <div>Post note founded</div>;
    }

    return (
        <Layout variant="small">
             <Formik initialValues={{title: data.post.title, text: data.post.text}}
                    onSubmit={async (values) => {
                        await updatePost({
                            title: values.title,
                            text: values.text,
                            id: postId
                        });
                        router.back();
                    }}>
                    {({isSubmitting}: any) => (
                        <Form>
                            <InputField
                                name="title"
                                label="Title"
                                placeholder="post title"
                            />
                            <Box mt={4}>
                                <InputField
                                    textarea
                                    label="Text"
                                    name="text"
                                    placeholder="text body"
                                />
                            </Box>
                            <Button
                                mt={4}
                                type="submit"
                                colorScheme="teal"
                                isLoading={isSubmitting}
                            >
                                Edit
                            </Button>
                        </Form>
                    )}
                </Formik>
        </Layout>
    );
}

export default withUrqlClient(CreateUrqlClient)(EditPost);
