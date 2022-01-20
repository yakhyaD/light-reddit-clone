import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react';
import React from 'react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';
import { useRouter } from 'next/router';

interface NavbarProps {
}

const Navbar: React.FC<NavbarProps> = ({}) => {
    const router = useRouter()
    const [{data, fetching}] = useMeQuery({
        pause: isServer()
    })
    const [{fetching: LogoutFecth}, logout] = useLogoutMutation()
    let body = null;

    if(fetching){
        body = (
            <Box>Loading...</Box>
        )
    }else if(!data?.me){
        body = (
            <Box ml="auto" >
                <NextLink href="/login">
                    <Link mr={2} color="white" >
                        login
                    </Link>
                </NextLink>
                <NextLink href="/register">
                    <Link color="white" >
                        register
                    </Link>
                </NextLink>
            </Box>
        )
    }else{
        body = (
           <Flex ml="auto" align="center" direction="row">
                <NextLink href="/create-post">
                    <Button as={Link} mr={4} color="white">
                        create post
                    </Button>
                </NextLink>
                <Box color="white" mr={2}>{data.me.username}</Box>
                <Button
                    variant="link"
                    onClick={async () => {
                        await logout()
                        router.reload()

                    }}
                    isLoading={LogoutFecth}
                >
                    logout
                </Button>
            </Flex>
        )

    }
        return (
            <Flex bg="teal" p={4} zIndex={1} position="sticky" top={0}>
                <Flex flex={1} align="center">
                    <NextLink href="/">
                        <Link>
                            <Heading color="white">Reddit</Heading>
                        </Link>
                    </NextLink>
                </Flex>
                {body}
            </Flex>
        );
}

export default Navbar;
