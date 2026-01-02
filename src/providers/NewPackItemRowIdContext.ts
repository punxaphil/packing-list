import { createContext, type RefObject, useContext } from 'react';

interface ContextType {
  newPackItemRowId?: string;
  setNewPackItemRowId: (id?: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

export const NewPackItemRowIdContext = createContext<ContextType | undefined>(undefined);

export function useNewPackItemRowId() {
  const context = useContext(NewPackItemRowIdContext);
  if (context === undefined) {
    throw new Error('useNewPackItemRowId must be used within a NewPackItemRowIdContext');
  }
  return context;
}
