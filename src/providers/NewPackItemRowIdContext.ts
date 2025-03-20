import { createContext, useContext } from 'react';

interface UseNewPackItemRowId {
  newPackItemRowId?: string;
  setNewPackItemRowId: (id?: string) => void;
}

export const NewPackItemRowIdContext = createContext<UseNewPackItemRowId | undefined>(undefined);

export function useNewPackItemRowId() {
  const context = useContext(NewPackItemRowIdContext);
  if (context === undefined) {
    throw new Error('use context must be used within a Context component');
  }
  return context;
}
