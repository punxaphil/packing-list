import { Box, CreateToastFnReturn } from '@chakra-ui/react';
import { ArrayError } from '../../types/ArrayError.ts';

export function handleArrayError(e: Error, toast: CreateToastFnReturn) {
  if (e instanceof ArrayError) {
    toast({
      render: () => (
        <Box color="white" p={3} bg="red.600" borderRadius="md">
          {e.array.map((error) => (
            <Box key={error}>{error}</Box>
          ))}
        </Box>
      ),
    });
  } else {
    toast({
      title: 'Operation failed',
      description: JSON.stringify(e),
      status: 'error',
    });
  }
}
