import { Button,  Box, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import router from 'next/router';
import React from 'react'
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { CreateUrqlClient } from '../utils/createUrqlClient';
import { ToErrorMap } from '../utils/toErrorMap';
import NextLink from 'next/link';

interface loginProps {

}

const login: React.FC<loginProps> = ({}) => {
    const [, login] = useLoginMutation()
    return (
            <Wrapper variant="small">
                <Formik initialValues={{usernameOrEmail: "", password:""}}
                    onSubmit={async (values, {setErrors}) => {
                       const response = await login(values);
                       if(response.data?.login.errors){
                           setErrors(ToErrorMap(response.data.login.errors))
                       }else{
                           if(typeof router.query.next === "string"){
                               router.push(router.query.next);
                           }else{
                               router.push('/')
                           }
                       }
                    } }>
                    {({isSubmitting}: any) => (
                        <Form>
                            <InputField
                                name="usernameOrEmail"
                                label="Username or Email"
                                placeholder="username or email"
                            />
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
                                Login
                            </Button>
                        </Form>
                    )}
                </Formik>
                <Box mt="4">
                    <NextLink href="/forgot-password">
                        <Link mr={2} color="teal" >
                            Forgot your password? Click here
                        </Link>
                    </NextLink>
                </Box>
            </Wrapper>
        );
}

export default withUrqlClient(CreateUrqlClient)(login);
