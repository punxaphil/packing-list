import { Box, Flex, Heading } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

export function TextProgress({ text }: { text: string }) {
  const dotFlashing = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;
  return (
    <Flex justifyContent="center" h="100vh" align="center">
      <Heading as="h3">
        {text}
        <Box as="span" animation={`${dotFlashing} 1s infinite`} mx="1">
          .
        </Box>
        <Box as="span" animation={`${dotFlashing} 1s infinite 0.2s`} mx="1">
          .
        </Box>
        <Box as="span" animation={`${dotFlashing} 1s infinite 0.4s`} mx="1">
          .
        </Box>
      </Heading>
    </Flex>
  );
}
