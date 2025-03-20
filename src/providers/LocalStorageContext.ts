import { createContext, useContext } from 'react';

interface UseLocalStorage {
  packingListId: string;
  setPackingListId: (packingListId: string) => void;
}

export const LocalStorageContext = createContext<UseLocalStorage | undefined>(undefined);

export function useLocalStorage() {
  const context = useContext(LocalStorageContext);
  if (context === undefined) {
    throw new Error('use context must be used within a Context component');
  }
  return context;
}
