import { useBreakpointValue } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';
import {
  CHECKED_FILTER_STATE,
  UNCHECKED_FILTER_STATE,
  WITHOUT_MEMBERS_ID,
} from '~/components/pages/PackingList/Filter.tsx';
import { createColumns, flattenGroupedPackItems } from '~/components/pages/PackingList/packingListUtils.ts';
import { TextProgress } from '~/components/shared/TextProgress.tsx';
import { readDb } from '~/services/database.ts';
import { groupByCategories, sortAll } from '~/services/utils.ts';
import { ColumnList } from '~/types/Column.ts';
import { GroupedPackItem } from '~/types/GroupedPackItem.ts';
import { Image } from '~/types/Image.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import { DatabaseContext } from './DatabaseContext.ts';
import { usePackingList } from './PackingListContext.ts';

type FilterState = {
  showTheseCategories: string[];
  showTheseMembers: string[];
  showTheseStates: string[];
};

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<NamedEntity[]>();
  const [categories, setCategories] = useState<NamedEntity[]>();
  const [packItems, setPackItems] = useState<PackItem[]>();
  const [images, setImages] = useState<Image[]>();
  const [packingLists, setPackingLists] = useState<NamedEntity[]>();
  const { packingList } = usePackingList();

  const [currentFilterState, setCurrentFilterState] = useState<FilterState | null>(getInitialFilterState);

  const nbrOfColumns: 1 | 2 | 3 = useBreakpointValue({ base: 1, sm: 1, md: 2, lg: 3 }) ?? 3;

  function getInitialFilterState(): FilterState | null {
    const savedCategories = localStorage.getItem('filteredCategories');
    const savedMembers = localStorage.getItem('filteredMembers');
    const savedStates = localStorage.getItem('filteredPackItemState');

    if (savedCategories || savedMembers || savedStates) {
      return {
        showTheseCategories: savedCategories ? JSON.parse(savedCategories) : [],
        showTheseMembers: savedMembers ? JSON.parse(savedMembers) : [],
        showTheseStates: savedStates ? JSON.parse(savedStates) : [],
      };
    }
    return null;
  }

  function persistFiltersToLocalStorage(filters: FilterState) {
    localStorage.setItem('filteredCategories', JSON.stringify(filters.showTheseCategories));
    localStorage.setItem('filteredMembers', JSON.stringify(filters.showTheseMembers));
    localStorage.setItem('filteredPackItemState', JSON.stringify(filters.showTheseStates));
  }

  function filterByCategories(packItems: PackItem[], categoryIds: string[]): PackItem[] {
    if (!categoryIds.length) {
      return packItems;
    }
    return packItems.filter((item) => categoryIds.includes(item.category));
  }

  function filterByMembers(packItems: PackItem[], memberIds: string[]): PackItem[] {
    if (!memberIds.length) {
      return packItems;
    }

    return packItems.filter((item) => {
      const hasNoMembers = item.members.length === 0;
      const withoutMembersSelected = memberIds.includes(WITHOUT_MEMBERS_ID);

      // If "Without members" is selected and item has no members, include it
      if (withoutMembersSelected && hasNoMembers) {
        return true;
      }

      // If item has members, check if any member matches the selected filters
      // But exclude "Without members" from this check
      if (item.members.length > 0) {
        const nonEmptyMemberIds = memberIds.filter((id) => id !== WITHOUT_MEMBERS_ID);
        if (nonEmptyMemberIds.length === 0) {
          // Only "Without members" is selected, so exclude items with members
          return false;
        }
        const hasMatchingMember = item.members.some((m) => nonEmptyMemberIds.includes(m.id));
        return hasMatchingMember;
      }

      return false;
    });
  }

  function filterByStates(packItems: PackItem[], states: string[]): PackItem[] {
    if (!states.length) {
      return packItems;
    }
    return packItems.filter(
      (item) =>
        (states.includes(CHECKED_FILTER_STATE) && item.checked) ||
        (states.includes(UNCHECKED_FILTER_STATE) && !item.checked)
    );
  }

  function applyAllFilters(packItems: PackItem[], filterState: FilterState | null): PackItem[] {
    if (!filterState || !packItems) {
      return packItems;
    }

    const { showTheseCategories, showTheseMembers, showTheseStates } = filterState;

    let filtered = filterByCategories(packItems, showTheseCategories);
    filtered = filterByMembers(filtered, showTheseMembers);
    filtered = filterByStates(filtered, showTheseStates);

    return filtered;
  }

  function getCategoriesInPackingList(categories: NamedEntity[], packItems: PackItem[]): NamedEntity[] {
    return categories.filter((c) => packItems.some((p) => p.category === c.id));
  }

  function getMembersInPackingList(members: NamedEntity[], packItems: PackItem[]): NamedEntity[] {
    return members.filter((m) => packItems.some((p) => p.members.some((t) => t.id === m.id)));
  }

  function updateAndPersistFilters(newFilters: FilterState) {
    setCurrentFilterState(newFilters);
    persistFiltersToLocalStorage(newFilters);
  }

  useEffect(() => {
    (async () => {
      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        throw new Error('No user logged in');
      }
      if (packingList) {
        await readDb.getUserCollectionsAndSubscribe(
          setMembers,
          setCategories,
          setPackItems,
          setImages,
          setPackingLists,
          packingList.id
        );
      }
    })().catch(console.error);
  }, [packingList]);

  let groupedPackItems: GroupedPackItem[] = [];
  let columns: ColumnList[] = [];
  let categoriesInPackingList: NamedEntity[] = [];
  let membersInPackingList: NamedEntity[] = [];
  const isInitialized = members && categories && packItems && images && packingLists && packingList;
  if (isInitialized) {
    sortAll(members, categories, packItems, packingLists);
    const filtered = applyAllFilters(packItems, currentFilterState);
    groupedPackItems = groupByCategories(filtered, categories);
    const flattened = flattenGroupedPackItems(groupedPackItems);
    columns = createColumns(flattened, nbrOfColumns);
    categoriesInPackingList = getCategoriesInPackingList(categories, packItems);
    membersInPackingList = getMembersInPackingList(members, packItems);
  }

  return (
    <>
      {isInitialized ? (
        <DatabaseContext.Provider
          value={{
            members,
            categories,
            packItems,
            images,
            packingLists,
            groupedPackItems,
            columns,
            nbrOfColumns,
            categoriesInPackingList,
            membersInPackingList,
            filter: currentFilterState,
            setFilter: updateAndPersistFilters,
          }}
        >
          {children}
        </DatabaseContext.Provider>
      ) : (
        <TextProgress text="Loading your packing lists" />
      )}
    </>
  );
}
