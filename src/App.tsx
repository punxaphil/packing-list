import { useCurrentUser } from './components/auth/Auth.tsx';
import { useError } from './services/contexts.ts';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  ChakraProvider,
  extendTheme,
  withDefaultColorScheme,
} from '@chakra-ui/react';
import { Route, Routes } from 'react-router';
import PackingList from './components/pages/PackingList.tsx';
import { Layout } from './components/pages/Layout.tsx';
import Members from './components/pages/Members.tsx';
import Categories from './components/pages/Categories.tsx';
import { Welcome } from './components/pages/Welcome.tsx';

const customTheme = extendTheme(withDefaultColorScheme({ colorScheme: 'teal' }));
const TITLE = "Pack'n'Go!";

export default function App() {
  const { userId } = useCurrentUser();
  const { error, setError } = useError();
  const isLoggedIn = !!userId;
  return (
    <ChakraProvider theme={customTheme}>
      <Routes>
        {isLoggedIn ? (
          <Route element={<Layout userId={userId} title={TITLE} />}>
            <Route index element={<PackingList />} />
            <Route path="members" element={<Members />} />
            <Route path="categories" element={<Categories />} />
          </Route>
        ) : (
          <Route path="*" element={<Welcome title={TITLE} />} />
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
