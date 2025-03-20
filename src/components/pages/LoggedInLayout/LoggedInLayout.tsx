import { Outlet } from 'react-router';
import { Header } from '~/components/pages/LoggedInLayout/Header.tsx';
import { ApiProvider } from '~/providers/ApiProvider.tsx';
import { useFullscreenMode } from '~/providers/FullscreenModeContext.ts';
import { LocalStorageProvider } from '~/providers/LocalStorageProvider.tsx';
import { ModelProvider } from '~/providers/ModelProvider.tsx';

export function LoggedInLayout() {
  const { fullscreenMode } = useFullscreenMode();
  return (
    <LocalStorageProvider>
      <ApiProvider>
        <ModelProvider>
          {!fullscreenMode && <Header />}
          <Outlet />
        </ModelProvider>
      </ApiProvider>
    </LocalStorageProvider>
  );
}
