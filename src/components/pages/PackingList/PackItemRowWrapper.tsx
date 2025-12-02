import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function PackItemRowWrapper({ children, bgColor }: { children: ReactNode; bgColor?: string }) {
  return (
    <Box mx="2" bgColor={bgColor}>
      {children}
    </Box>
  );
}
