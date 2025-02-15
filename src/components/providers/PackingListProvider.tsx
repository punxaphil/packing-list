import { ReactNode, useEffect, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { PackingListContext } from './PackingListContext.ts';

const LOCAL_STORAGE_KEY = 'packingListId';

export function PackingListProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string>('');

  useEffect(() => {
    (async () => {
      let initialId = localStorage.getItem(LOCAL_STORAGE_KEY) as string;
      if (initialId) {
        const list = await firebase.getPackingList(initialId);
        if (list) {
          setId(initialId);
          return;
        }
      }
      const list = await firebase.getFirstPackingList();
      if (list) {
        initialId = list.id;
      } else {
        initialId = await firebase.addPackingList('My Packing List');
      }
      setId(initialId);
      localStorage.setItem(LOCAL_STORAGE_KEY, initialId);
    })().catch(console.error);
  }, []);

  function onIdChanged(id: string) {
    setId(id);
    localStorage.setItem(LOCAL_STORAGE_KEY, id);
  }

  return (
    <PackingListContext.Provider value={{ packingListId: id, setPackingListId: onIdChanged }}>
      {children}
    </PackingListContext.Provider>
  );
}
