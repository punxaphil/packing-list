import { Box, Heading, Stack } from '@chakra-ui/react';
import { Login } from '../auth/Auth.tsx';

export function Welcome() {
  return (
    <Stack alignItems="center">
      <Heading as="h3" m="6">
        Welcome to Pack'n'Go!
      </Heading>
      <Box mb="2">Start preparing your trip by logging in or registering below ✈</Box>
      <img src="/squirrel_400.png" alt="squirrel" style={{ maxWidth: '90%' }} />
      <Login />
    </Stack>
  );
}
