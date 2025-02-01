import { Login, useCurrentUser } from './components/auth/Auth.tsx';
import { Layout } from './components/layout/Layout.tsx';
import { useError } from './services/contexts.ts';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  ChakraProvider,
  extendTheme,
  Flex,
  Heading,
  withDefaultColorScheme,
} from '@chakra-ui/react';

const customTheme = extendTheme(withDefaultColorScheme({ colorScheme: 'teal' }));
const TITLE = "Pack'n'Go!";

export default function App() {
  const { userId, loggingIn } = useCurrentUser();
  const { error, setError } = useError();
  const isLoggedIn = !!userId;
  return (
    <ChakraProvider theme={customTheme}>
      <Box m="6">
        {isLoggedIn ? (
          <Layout userId={userId} title={TITLE} />
        ) : (
          <Flex justifyContent="space-between" direction="column" align="center">
            {loggingIn ? (
              <Heading as="h3">Logging in...</Heading>
            ) : (
              <>
                <Heading as="h3" m="6">Welcome to {TITLE}</Heading>
                <Box mb="2">Start preparing your trip by logging in or registering below ✈️</Box>
                <img src="/squirrel_400.png" alt="squirrel" style={{ maxWidth: '90%' }} />
                <Login />
              </>
            )}
          </Flex>
        )}
      </Box>
      {error && (
        <Box position="fixed" bottom="0" m="5">
          <Alert status="error" onClick={() => setError('')}>
            <AlertIcon />
            <AlertTitle>Error detected!</AlertTitle>
            <AlertDescription>{error.toString()}</AlertDescription>
          </Alert>
        </Box>
      )}
    </ChakraProvider>
  );
}
