import { Box, Heading } from '@chakra-ui/react';
import { Login, useCurrentUser } from '../auth/Auth.tsx';

export function Welcome({ title }: { title: string }) {
  const { loggingIn } = useCurrentUser();

  return loggingIn ? (
    <Heading as="h3">Logging in...</Heading>
  ) : (
    <>
      <Heading as="h3" m="6">
        Welcome to {title}
      </Heading>
      <Box mb="2">Start preparing your trip by logging in or registering below ✈️</Box>
      <img src="/squirrel_400.png" alt="squirrel" style={{ maxWidth: '90%' }} />
      <Login />
    </>
  );
}
