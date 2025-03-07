import { createContext, useContext } from 'react';
import { NamedEntity } from '../../types/NamedEntity.ts';

interface PackingListIdType {
  packingList: NamedEntity;
  setPackingListId: (packingListId: string) => void;
}

export const PackingListContext = createContext<PackingListIdType | undefined>(undefined);

export function usePackingListId() {
  const context = useContext(PackingListContext);
  if (context === undefined) {
    throw new Error('usePackingListId must be used within a PackingListProvider');
  }
  return context;
}
