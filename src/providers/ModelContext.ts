import { createContext, useContext } from 'react';
import { ColumnList } from '~/types/Column.ts';
import { GroupedPackItem } from '~/types/GroupedPackItem.ts';
import { Image } from '~/types/Image.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';

interface UseModel {
  members: NamedEntity[];
  packItems: PackItem[];
  categories: NamedEntity[];
  images: Image[];
  packingList: NamedEntity;
  packingLists: NamedEntity[];
  groupedPackItems: GroupedPackItem[];
  columns: ColumnList[];
  nbrOfColumns: 1 | 2 | 3;
  categoriesInPackingList: NamedEntity[];
  membersInPackingList: NamedEntity[];
  setFilter: ({
    showTheseCategories,
    showTheseMembers,
    showTheseStates,
  }: { showTheseCategories: string[]; showTheseMembers: string[]; showTheseStates: string[] }) => void;
}

export const ModelContext = createContext<UseModel | undefined>(undefined);

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('use context must be used within a Context component');
  }
  return context;
}
