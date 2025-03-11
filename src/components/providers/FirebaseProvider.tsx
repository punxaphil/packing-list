import { useMediaQuery } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { groupByCategories, sortAll } from '../../services/utils.ts';
import { ColumnList } from '../../types/Column.ts';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';
import { Image } from '../../types/Image.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { MEDIA_QUERIES, createColumns, flattenGroupedPackItems } from '../packing-list/packingListUtils.ts';
import { CHECKED_FILTER_STATE, UNCHECKED_FILTER_STATE } from '../shared/Filter.tsx';
import { TextProgress } from '../shared/TextProgress.tsx';
import { FirebaseContext } from './FirebaseContext.ts';
import { usePackingList } from './PackingListContext.ts';

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<NamedEntity[]>();
  const [categories, setCategories] = useState<NamedEntity[]>();
  const [packItems, setPackItems] = useState<PackItem[]>();
  const [images, setImages] = useState<Image[]>();
  const [packingLists, setPackingLists] = useState<NamedEntity[]>();
  const { packingList } = usePackingList();
  const [filter, setFilter] = useState<{
    showTheseCategories: string[];
    showTheseMembers: string[];
    showTheseStates: string[];
  } | null>(null);
  const [isMin800px, isMin1200px] = useMediaQuery(MEDIA_QUERIES);
  const nbrOfColumns = isMin1200px ? 3 : isMin800px ? 2 : 1;

  useEffect(() => {
    (async () => {
      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        throw new Error('No user logged in');
      }
      if (packingList) {
        await firebase.getUserCollectionsAndSubscribe(
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
    const filtered = filterPackItems(packItems);
    groupedPackItems = groupByCategories(filtered, categories);
    const flattened = flattenGroupedPackItems(groupedPackItems);
    columns = createColumns(flattened, nbrOfColumns);
    categoriesInPackingList = categories.filter((c) => {
      return packItems.some((p) => p.category === c.id);
    });
    membersInPackingList = members.filter((m) => packItems.some((p) => p.members.some((t) => t.id === m.id)));
  }

  function filterPackItems(packItems: PackItem[]) {
    if (!filter || !packItems) {
      return packItems;
    }
    const { showTheseCategories, showTheseMembers, showTheseStates } = filter;
    let filtered = !showTheseCategories.length
      ? packItems
      : packItems.filter((item) => showTheseCategories.includes(item.category));
    filtered = !showTheseMembers.length
      ? filtered
      : filtered.filter((item) => {
          if (showTheseMembers.includes('') && item.members.length === 0) {
            return true;
          }
          if (item.members.length) {
            return item.members.some((m) => showTheseMembers.includes(m.id));
          }
        });
    return !showTheseStates.length
      ? filtered
      : filtered.filter(
          (item) =>
            (showTheseStates.includes(CHECKED_FILTER_STATE) && item.checked) ||
            (showTheseStates.includes(UNCHECKED_FILTER_STATE) && !item.checked)
        );
  }
  return (
    <>
      {isInitialized ? (
        <FirebaseContext.Provider
          value={{
            members,
            categories,
            packItems,
            images,
            packingLists,
            groupedPackItems,
            columns,
            categoriesInPackingList,
            membersInPackingList,
            setFilter,
          }}
        >
          {children}
        </FirebaseContext.Provider>
      ) : (
        <TextProgress text="Loading your packing lists" />
      )}
    </>
  );
}
