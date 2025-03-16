import { createContext, useContext } from 'react';

interface ContextType {
  fullscreenMode: boolean;
  setFullscreenMode: (fullscreenMode: boolean) => void;
}

export const FullscreenModeContext = createContext<ContextType | undefined>(undefined);

export function useFullscreenMode() {
  const context = useContext(FullscreenModeContext);
  if (context === undefined) {
    throw new Error('useFullscreenMode must be used within a FullscreenModeContext');
  }
  return context;
}
