import { createContext, useContext } from 'react';
import { ColumnList } from '~/types/Column.ts';
import { GroupedPackItem } from '~/types/GroupedPackItem.ts';
import { Image } from '~/types/Image.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';

interface ContextType {
  members: NamedEntity[];
  packItems: PackItem[];
  categories: NamedEntity[];
  images: Image[];
  packingLists: NamedEntity[];
  groupedPackItems: GroupedPackItem[];
  columns: ColumnList[];
  nbrOfColumns: 1 | 2 | 3;
  categoriesInPackingList: NamedEntity[];
  membersInPackingList: NamedEntity[];
  isLoadingPackItems: boolean;
  filter: {
    showTheseCategories: string[];
    showTheseMembers: string[];
    showTheseStates: string[];
    searchText?: string;
  } | null;
  setFilter: ({
    showTheseCategories,
    showTheseMembers,
    showTheseStates,
    searchText,
  }: {
    showTheseCategories: string[];
    showTheseMembers: string[];
    showTheseStates: string[];
    searchText?: string;
  }) => void;
}

export const DatabaseContext = createContext<ContextType | undefined>(undefined);

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseContext.Provider');
  }
  return context;
}
