import { ReactNode, useRef, useState } from 'react';
import { NewPackItemRowIdContext } from './NewPackItemRowIdContext.ts';

export function NewPackItemRowIdProvider({ children }: { children: ReactNode }) {
  const [newPackItemRowId, setNewPackItemRowId] = useState<string | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <NewPackItemRowIdContext.Provider value={{ newPackItemRowId, setNewPackItemRowId, inputRef }}>
      {children}
      <input
        ref={inputRef}
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          opacity: 0,
          width: '1px',
          height: '1px',
        }}
        aria-hidden="true"
        tabIndex={-1}
      />
    </NewPackItemRowIdContext.Provider>
  );
}
