import { createContext, useContext } from 'react';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';
import { Image } from '../../types/Image.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';

interface FirebaseData {
  members: NamedEntity[];
  packItems: PackItem[];
  categories: NamedEntity[];
  images: Image[];
  packingLists: NamedEntity[];
  groupedPackItems: GroupedPackItem[];
}

export const FirebaseContext = createContext<FirebaseData | undefined>(undefined);

export function useFirebase() {
  const firebaseContext = useContext(FirebaseContext);
  if (firebaseContext === undefined) {
    throw new Error('useFirebase must be used within a FirebaseContext.Provider');
  }
  return firebaseContext;
}
