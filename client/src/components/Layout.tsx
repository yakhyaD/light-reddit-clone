import { Box } from '@chakra-ui/react';
import React from 'react'
import Navbar from './Navbar';
import { WrapperProps } from './Wrapper';

const Layout: React.FC<WrapperProps> = ({children ,variant = "regular"}) => {
        return (
            <>
                <Navbar />
                <Box mt={8}
                    mx="auto"
                    maxW={variant === "regular" ? "800px" : "500px"}
                    w="100%"
                >
                    {children}
                </Box>
            </>
        );
}

export default Layout;
