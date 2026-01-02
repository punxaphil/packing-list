import { createContext, useContext } from 'react';

interface VersionContextType {
  scheduleVersionSave: (reason: string) => void;
  cancelScheduledSave: () => void;
}

export const VersionContext = createContext<VersionContextType | null>(null);

export function useVersion() {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useVersion must be used within a VersionProvider');
  }
  return context;
}
