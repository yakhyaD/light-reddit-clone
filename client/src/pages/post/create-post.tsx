import { Box } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import React from "react";
import InputField from "../../components/InputField";
import Layout from "../../components/Layout";
import { useCreatePostMutation } from "../../generated/graphql";
import { CreateUrqlClient } from "../../utils/createUrqlClient";
import { useIsAuth } from "../../utils/useIsAuth";


interface createPostProps {
}

const CreatePost: React.FC<createPostProps> = ({ }) => {
    const [, createPost] = useCreatePostMutation()
    useIsAuth()

    return (
        <Layout variant="small">
            <Formik initialValues={{ title: "", text: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const { error } = await createPost({ input: values })
                    if (!error) {
                        router.push('/')
                    }
                }}>
                {({ isSubmitting }: any) => (
                    <Form>
                        <InputField
                            name="title"
                            label="Title"
                            placeholder="post title"
                        />
                        <Box mt={4}>
                            <InputField
                                textarea
                                name="text"
                                label="Text"
                                placeholder="text body"
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Create
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(CreateUrqlClient, { ssr: true })(CreatePost)
