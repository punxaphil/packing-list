import { ReactNode, useEffect, useState } from 'react';
import { LocalStorageContext } from './LocalStorageContext.ts';

const LOCAL_STORAGE_KEY = 'packingListId';

export function LocalStorageProvider({ children }: { children: ReactNode }) {
  const [packingListId, setPackingListId] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const initialId = localStorage.getItem(LOCAL_STORAGE_KEY) as string;
      setPackingListId(initialId);
    })().catch(console.error);
  }, []);

  async function onIdChanged(id: string) {
    setPackingListId(id);
    localStorage.setItem(LOCAL_STORAGE_KEY, id);
  }
  if (!packingListId) {
    return null;
  }
  return (
    <LocalStorageContext.Provider value={{ packingListId, setPackingListId: onIdChanged }}>
      {children}
    </LocalStorageContext.Provider>
  );
}
