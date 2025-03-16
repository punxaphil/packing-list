import { ReactNode, useState } from 'react';
import { NewPackItemRowIdContext } from './NewPackItemRowIdContext.ts';

export function NewPackItemRowIdProvider({ children }: { children: ReactNode }) {
  const [newPackItemRowId, setNewPackItemRowId] = useState<string | undefined>();

  return (
    <NewPackItemRowIdContext.Provider value={{ newPackItemRowId, setNewPackItemRowId }}>
      {children}
    </NewPackItemRowIdContext.Provider>
  );
}
