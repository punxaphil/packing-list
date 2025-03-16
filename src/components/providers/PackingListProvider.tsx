import { ReactNode, useEffect, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackingListContext } from './PackingListContext.ts';

const LOCAL_STORAGE_KEY = 'packingListId';

export function PackingListProvider({ children }: { children: ReactNode }) {
  const [packingList, setPackingList] = useState<NamedEntity | undefined>();

  useEffect(() => {
    (async () => {
      let initialId = localStorage.getItem(LOCAL_STORAGE_KEY) as string;
      if (initialId) {
        const list = await firebase.getPackingList(initialId);
        if (list) {
          setPackingList(list);
          return;
        }
      }
      const list = await firebase.getFirstPackingList();
      if (list) {
        initialId = list.id;
        setPackingList(list);
      } else {
        const name = 'My Packing List';
        const rank = 0;
        initialId = await firebase.addPackingList(name, rank);
        setPackingList({ id: initialId, name, rank });
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, initialId);
    })().catch(console.error);
  }, []);

  async function onIdChanged(id: string) {
    const list = await firebase.getPackingList(id);
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
