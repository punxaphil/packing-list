import { Outlet } from 'react-router';
import { Header } from '~/components/pages/LoggedInLayout/Header.tsx';
import { DatabaseProvider } from '~/providers/DatabaseProvider.tsx';
import { useFullscreenMode } from '~/providers/FullscreenModeContext.ts';
import { PackingListProvider } from '~/providers/PackingListProvider.tsx';
import { UndoProvider } from '~/providers/UndoProvider.tsx';

export function LoggedInLayout() {
  const { fullscreenMode } = useFullscreenMode();
  return (
    <PackingListProvider>
      <DatabaseProvider>
        <UndoProvider>
          {!fullscreenMode && <Header />}
          <Outlet />
        </UndoProvider>
      </DatabaseProvider>
    </PackingListProvider>
  );
}
