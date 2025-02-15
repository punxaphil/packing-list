import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function PackItemRowWrapper({
  children,
  indent,
}: {
  children: ReactNode;
  indent: boolean;
}) {
  return <Box ml={indent ? '3' : '0'}>{children}</Box>;
}
