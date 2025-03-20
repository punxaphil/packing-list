import { createContext, useContext } from 'react';

interface UseFullscreenMode {
  fullscreenMode: boolean;
  setFullscreenMode: (fullscreenMode: boolean) => void;
}

export const FullscreenModeContext = createContext<UseFullscreenMode | undefined>(undefined);

export function useFullscreenMode() {
  const context = useContext(FullscreenModeContext);
  if (context === undefined) {
    throw new Error('use context must be used within a Context component');
  }
  return context;
}
