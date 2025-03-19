import { createContext, useContext } from 'react';
import { ColumnList } from '~/types/Column.ts';
import { GroupedPackItem } from '~/types/GroupedPackItem.ts';
import { HistoryItem } from '~/types/HistoryItem.ts';
import { Image } from '~/types/Image.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import type { Database } from '~/services/database.ts';

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
  setFilter: ({
    showTheseCategories,
    showTheseMembers,
    showTheseStates,
  }: { showTheseCategories: string[]; showTheseMembers: string[]; showTheseStates: string[] }) => void;
  dbInvoke: Database;
  changeHistory: HistoryItem[];
}

export const DatabaseContext = createContext<ContextType | undefined>(undefined);

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseContext.Provider');
  }
  return context;
}
