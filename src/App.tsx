import { Route, Routes } from 'react-router';
import { useCurrentUser } from './components/auth/Auth.tsx';
import { Profile } from './components/pages/Profile.tsx';
import { Welcome } from './components/pages/Welcome.tsx';

import { LoggedInLayout } from '~/components/pages/LoggedInLayout/LoggedInLayout.tsx';
import { Categories } from '~/components/pages/NamedEntities/Categories.tsx';
import { Members } from '~/components/pages/NamedEntities/Members.tsx';
import { PackingList } from '~/components/pages/PackingList/PackingList.tsx';
import { PackingLists } from '~/components/pages/PackingLists/PackingLists.tsx';
import { TextProgress } from './components/shared/TextProgress.tsx';

export function App() {
  const { userId, loggingIn } = useCurrentUser();

  const isLoggedIn = !!userId;
  return (
    <Routes>
      {isLoggedIn ? (
        <Route element={<LoggedInLayout />}>
          <Route index element={<PackingList />} />
          <Route path="members" element={<Members />} />
          <Route path="categories" element={<Categories />} />
          <Route path="profile" element={<Profile />} />
          <Route path="packing-lists" element={<PackingLists />} />
        </Route>
      ) : loggingIn ? (
        <Route path="*" element={<TextProgress text="Logging In" />} />
      ) : (
        <Route path="*" element={<Welcome />} />
      )}
    </Routes>
  );
}
