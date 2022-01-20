import React from 'react';
import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useRegisterMutation } from '../generated/graphql';
import { ToErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql';
import { CreateUrqlClient } from '../utils/createUrqlClient';

interface registerProps {
}

const register: React.FC<registerProps> = ({}) => {
    const router = useRouter()
    const [, register ] = useRegisterMutation()

        return (
            <Wrapper variant="small">
                <Formik initialValues={{email: "", password:"", username: ""}}
                    onSubmit={async (values, {setErrors}) => {
                       const response = await register({options: values});
                       if(response.data?.register.errors){
                           setErrors(ToErrorMap(response.data.register.errors))
                       }else{
                            router.push('/')
                       }
                    } }>
                    {({isSubmitting}: any) => (
                        <Form>
                            <InputField
                                name="username"
                                label="Username"
                                placeholder="username"

                            />
                            <Box mt={4}>
                                <InputField
                                    name="email"
                                    label="Email"
                                    placeholder="john@gmail.com"
                                    type="email"

                                />
                            </Box>
                            <Box mt={4}>
                                <InputField
                                    name="password"
                                    label="Password"
                                    placeholder="password"
                                    type="password"

                                />
                            </Box>
                            <Button
                                mt={4}
                                type="submit"
                                colorScheme="teal"
                                isLoading={isSubmitting}
                            >
                                Register
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
        );
}

export default withUrqlClient(CreateUrqlClient)(register);
