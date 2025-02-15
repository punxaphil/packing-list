import { Outlet } from 'react-router';
import { FirebaseProvider } from '../providers/FirebaseProvider.tsx';
import { PackingListProvider } from '../providers/PackingListProvider.tsx';
import { Header } from '../shared/Header.tsx';

export function LoggedInLayout() {
  return (
    <PackingListProvider>
      <FirebaseProvider>
        <Header />
        <Outlet />
      </FirebaseProvider>
    </PackingListProvider>
  );
}
