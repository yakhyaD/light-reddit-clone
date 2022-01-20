import { Box } from '@chakra-ui/react';
import React from 'react'

export interface WrapperProps {
    variant?: "small" | "regular"
}

const Wrapper: React.FC<WrapperProps> = ({children ,variant = "regular"}) => {
        return (
            <Box mt={8}
                mx="auto"
                maxW={variant === "regular" ? "800px" : "500px"}
                w="100%"
            >
                {children}
            </Box>
        );
}

export default Wrapper;
