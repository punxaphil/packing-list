import { ReactNode, useEffect, useState } from 'react';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackingListContext } from './PackingListContext.ts';
import { Database } from '~/services/database.ts';

const LOCAL_STORAGE_KEY = 'packingListId';

export function PackingListProvider({ children }: { children: ReactNode }) {
  const [packingList, setPackingList] = useState<NamedEntity | undefined>();
  const db = new Database([], () => {}, ''); // Initialize with empty change history and setChangeHistory function
  useEffect(() => {
    (async () => {
      let initialId = localStorage.getItem(LOCAL_STORAGE_KEY) as string;
      if (initialId) {
        const list = await db.getPackingList(initialId);
        if (list) {
          setPackingList(list);
          return;
        }
      }
      const list = await db.getFirstPackingList();
      if (list) {
        initialId = list.id;
        setPackingList(list);
      } else {
        const name = 'My Packing List';
        const rank = 0;
        initialId = await db.addPackingList(name, rank);
        setPackingList({ id: initialId, name, rank });
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, initialId);
    })().catch(console.error);
  }, [db]);

  async function onIdChanged(id: string) {
    const list = await db.getPackingList(id);
    setPackingList(list);
    localStorage.setItem(LOCAL_STORAGE_KEY, id);
  }
  if (!packingList) {
    return null;
  }
  return (
    <PackingListContext.Provider value={{ packingList, setPackingListId: onIdChanged }}>
      {children}
    </PackingListContext.Provider>
  );
}
