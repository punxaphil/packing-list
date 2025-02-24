import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  ChakraProvider,
  Heading,
  extendTheme,
  withDefaultColorScheme,
} from '@chakra-ui/react';
import { Route, Routes } from 'react-router';
import { useCurrentUser } from './components/auth/Auth.tsx';
import { Categories } from './components/pages/Categories.tsx';
import { LoggedInLayout } from './components/pages/LoggedInLayout.tsx';
import { Members } from './components/pages/Members.tsx';
import { PackingList } from './components/pages/PackingList.tsx';
import { Profile } from './components/pages/Profile.tsx';
import { Welcome } from './components/pages/Welcome.tsx';
import { useError } from './components/providers/ErrorContext.ts';

export const THEME_COLOR = 'gray';
const customTheme = extendTheme(withDefaultColorScheme({ colorScheme: THEME_COLOR }), {
  components: {
    Link: {
      baseStyle: {
        color: THEME_COLOR,
      },
    },
    Spinner: {
      baseStyle: {
        color: THEME_COLOR,
      },
    },
  },
});

export function App() {
  const { userId, loggingIn } = useCurrentUser();
  const { error, setError } = useError();
  const isLoggedIn = !!userId;
  return (
    <ChakraProvider theme={customTheme}>
      <Routes>
        {isLoggedIn ? (
          <Route element={<LoggedInLayout />}>
            <Route index element={<PackingList />} />
            <Route path="members" element={<Members />} />
            <Route path="categories" element={<Categories />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        ) : loggingIn ? (
          <Route path="*" element={<Heading as="h3">Logging in...</Heading>} />
        ) : (
          <Route path="*" element={<Welcome />} />
        )}
      </Routes>
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
