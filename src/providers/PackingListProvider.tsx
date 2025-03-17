import { ReactNode, useEffect, useState } from 'react';
import { writeDb } from '~/services/database.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackingListContext } from './PackingListContext.ts';

const LOCAL_STORAGE_KEY = 'packingListId';

export function PackingListProvider({ children }: { children: ReactNode }) {
  const [packingList, setPackingList] = useState<NamedEntity | undefined>();

  useEffect(() => {
    (async () => {
      let initialId = localStorage.getItem(LOCAL_STORAGE_KEY) as string;
      if (initialId) {
        const list = await writeDb.getPackingList(initialId);
        if (list) {
          setPackingList(list);
          return;
        }
      }
      const list = await writeDb.getFirstPackingList();
      if (list) {
        initialId = list.id;
        setPackingList(list);
      } else {
        const name = 'My Packing List';
        const rank = 0;
        initialId = await writeDb.addPackingList(name, rank);
        setPackingList({ id: initialId, name, rank });
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, initialId);
    })().catch(console.error);
  }, []);

  async function onIdChanged(id: string) {
    const list = await writeDb.getPackingList(id);
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
