import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Button } from "@chakra-ui/button";
import { Box, Link } from "@chakra-ui/layout";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql"
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { CreateUrqlClient } from "../utils/createUrqlClient"

interface ForgotPasswordProps {
}

const ForgotPassword: React.FC<ForgotPasswordProps>  = ({}) => {
    const [emailSent, setEmailSent] = React.useState(false);
    const [, forgotPassword] = useForgotPasswordMutation();

    let body = (
        <Formik initialValues={{email: ""}}
            onSubmit={async (values) => {
                await forgotPassword(values);
                setEmailSent(true);
        }}>
        {({isSubmitting}: any) => (
            <Form>
                <Box mt={4}>
                    <InputField
                    name="email"
                    label="Your Email"
                    placeholder="your email"
                    type="email"
                    />
                </Box>
                <Button
                    mt={4}
                    type="submit"
                    colorScheme="teal"
                    isLoading={isSubmitting}
                >
                    Forgot Password
                </Button>
            </Form>
        )}
        </Formik>
    )

    if(emailSent) {
        body = (
            <Alert status="success">
                <AlertIcon />
                Password reset. Check your email to change password.
            </Alert>
        )
    }
    return (
        <Wrapper variant="small">
            {body}
        </Wrapper>
    )
}


export default withUrqlClient(CreateUrqlClient)(ForgotPassword)
