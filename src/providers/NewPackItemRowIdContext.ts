import { createContext, useContext } from 'react';

interface ContextType {
  newPackItemRowId?: string;
  setNewPackItemRowId: (id?: string) => void;
}

export const NewPackItemRowIdContext = createContext<ContextType | undefined>(undefined);

export function useNewPackItemRowId() {
  const context = useContext(NewPackItemRowIdContext);
  if (context === undefined) {
    throw new Error('useNewPackItemRowId must be used within a NewPackItemRowIdContext');
  }
  return context;
}
