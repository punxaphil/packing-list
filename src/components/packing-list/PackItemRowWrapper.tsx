import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function PackItemRowWrapper({
  children,
  indent,
  bgColor,
}: {
  children: ReactNode;
  indent: boolean;
  bgColor?: string;
}) {
  return (
    <Box ml={indent ? '3' : '0'} bgColor={bgColor}>
      {children}
    </Box>
  );
}
