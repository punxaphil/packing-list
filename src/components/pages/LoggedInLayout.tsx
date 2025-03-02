import { Outlet } from 'react-router';
import { FirebaseProvider } from '../providers/FirebaseProvider.tsx';
import { useFullscreenMode } from '../providers/FullscreenModeContext.ts';
import { PackingListProvider } from '../providers/PackingListProvider.tsx';
import { Header } from '../shared/Header.tsx';

export function LoggedInLayout() {
  const { fullscreenMode } = useFullscreenMode();
  return (
    <PackingListProvider>
      <FirebaseProvider>
        {!fullscreenMode && <Header />}
        <Outlet />
      </FirebaseProvider>
    </PackingListProvider>
  );
}
