import { Box, Button, FormHelperText, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage} from "next"
import { withUrqlClient } from "next-urql";
import React from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useResetPasswordMutation } from "../../generated/graphql";
import { CreateUrqlClient } from "../../utils/createUrqlClient";
import { ToErrorMap } from "../../utils/toErrorMap";
import router from 'next/router';
import NextLink from 'next/link';

const ResetPassword: NextPage = () => {
    const [{data}, resetPassword] = useResetPasswordMutation();
    const [tokenError, setTokenError] = React.useState("");

    return (
        <Wrapper variant="small">
                <Formik initialValues={{password: ""}}
                    onSubmit={async (values, {setErrors}) => {
                        const res = await resetPassword({
                            token: typeof router.query.token === "string" ? router.query.token : "",
                            newPassword: values.password
                        });
                      if (res.data?.resetPassword.errors) {
                        const errors = ToErrorMap(res.data.resetPassword.errors);
                        if("token" in errors) {
                            setTokenError(errors.token);
                        }
                        setErrors(errors);
                      }else{
                        router.push('/')
                      }
                    }
                    }>
                    {({isSubmitting}: any) => (
                        <Form>
                            <Box mt={4}>
                                <InputField
                                    name="password"
                                    label="Change Password"
                                    placeholder="new password"
                                    type="password"
                                />
                            </Box>
                            {tokenError ?
                                <FormHelperText color="red">
                                    {tokenError}
                                    <NextLink href="/forgot-password">
                                        <Link mr={2} color="teal" >
                                            Reset token
                                        </Link>
                                    </NextLink>
                                </FormHelperText>
                            : null }
                            <Button
                                mt={4}
                                type="submit"
                                colorScheme="teal"
                                isLoading={isSubmitting}
                            >
                                Change Password
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Wrapper>
    );
}

export default withUrqlClient(CreateUrqlClient)(ResetPassword);
