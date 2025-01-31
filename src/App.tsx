import '@radix-ui/themes/styles.css';

import { Box, Callout, Flex, Heading, Theme } from '@radix-ui/themes';
import { Login, Logout, useCurrentUser } from './components/auth/Auth.tsx';
import { ManageList } from './components/manage-list/ManageList.tsx';
import { useError } from './services/contexts.ts';
import { InfoCircledIcon } from '@radix-ui/react-icons';

const TITLE = "Pack'n'Go!";

export default function App() {
  const { userId, loggingIn } = useCurrentUser();
  const { error, setError } = useError();
  const isLoggedIn = !!userId;
  return (
    <Theme accentColor="teal">
      <Box>
        {isLoggedIn ? (
          <>
            <Flex gap="3" align="center" justify="between" my="3">
              <Flex gap="3" align="center">
                <img src="/squirrel_icon.png" alt="squirrel icon" />
                <Heading as="h1">{TITLE}</Heading>
              </Flex>
              <Logout />
            </Flex>
            <ManageList userId={userId} />
          </>
        ) : (
          <Flex justify="between" direction="column" align="center" gap="3">
            {loggingIn ? (
              <Heading as="h3">Logging in...</Heading>
            ) : (
              <>
                <Heading as="h3">Welcome to {TITLE}</Heading>
                <Box>Start preparing your trip by logging in or registering below ✈️</Box>
                <img src="/squirrel_400.png" alt="squirrel" style={{ maxWidth: '90%' }} />
                <Login />
              </>
            )}
          </Flex>
        )}
      </Box>
      {error && (
        <Box position="fixed" bottom="0" m="5">
          <Callout.Root color="red" onClick={() => setError('')}>
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>WARNING! {error.toString()}</Callout.Text>
          </Callout.Root>
        </Box>
      )}
    </Theme>
  );
}
