import { ReactNode, useMemo, useState } from 'react';
import { FullscreenModeContext } from './FullscreenModeContext.ts';

const LOCAL_STORAGE_KEY = 'fullscreenMode';

export function FullscreenModeProvider({ children }: { children: ReactNode }) {
  const [fullscreen, setFullscreen] = useState(false);
  useMemo(() => {
    const initialId = localStorage.getItem(LOCAL_STORAGE_KEY) as string;
    setFullscreen(!!initialId);
  }, []);

  function onChanged(fullscreenMode: boolean) {
    setFullscreen(fullscreenMode);
    localStorage.setItem(LOCAL_STORAGE_KEY, fullscreenMode ? 'true' : '');
  }

  return (
    <FullscreenModeContext.Provider value={{ fullscreenMode: fullscreen, setFullscreenMode: onChanged }}>
      {children}
    </FullscreenModeContext.Provider>
  );
}
