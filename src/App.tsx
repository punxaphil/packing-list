import '@radix-ui/themes/styles.css';

import { Box, Flex, Heading, Theme } from '@radix-ui/themes';
import { Auth, useCurrentUser } from './components/auth/Auth.tsx';
import { ManageList } from './components/manage-list/ManageList.tsx';

const TITLE = "Pack'n'Go!";

export default function App() {
  const { userId, loggingIn } = useCurrentUser();
  const isLoggedIn = !!userId;
  return (
    <Theme accentColor="teal">
      <Box>
        <Flex gap="3" align="center" justify="between" my="3">
          <Flex gap="3" align="center">
            <img src="/squirrel_icon.png" alt="squirrel icon" />
            <Heading as="h1">{TITLE}</Heading>
          </Flex>
          <Auth />
        </Flex>
        {isLoggedIn ? (
          <ManageList userId={userId} />
        ) : (
          <Flex justify="between" direction="column" align="center" gap="3">
            {loggingIn ? (
              <Heading as="h3">Logging in...</Heading>
            ) : (
              <>
                <Heading as="h3">Welcome to {TITLE}</Heading>
                <Box>
                  Start preparing your trip by logging in or registering in the top right corner of this page ✈️
                </Box>
                <img src="/squirrel_400.png" alt="squirrel" />
              </>
            )}
          </Flex>
        )}
      </Box>
    </Theme>
  );
}
