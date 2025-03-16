import { Button, Flex } from '@chakra-ui/react';
import { DragDropContext, Draggable, DropResult, Droppable } from '@hello-pangea/dnd';
import { useEffect, useMemo, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { reorderAndSave } from '../../services/reorderUtils.ts';
import { findUniqueName, rankOnTop } from '../../services/utils.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { PackingListWithItems } from '../../types/PackingListsWithItems.ts';
import { useError } from '../providers/ErrorContext.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingList } from '../providers/PackingListContext.ts';
import { PackingListCard } from '../shared/PackingListCard.tsx';

export function PackingLists() {
  const [reordered, setReordered] = useState<NamedEntity[]>([]);
  const initialPackingLists = useFirebase().packingLists;
  const [packingListsWithItems, setPackingListsWithItems] = useState<PackingListWithItems[]>([]);
  const [allPackItems, setAllPackItems] = useState<PackItem[]>([]);
  const currentList = usePackingList().packingList;
  const { setError } = useError();

  useEffect(() => {
    (async () => {
      setAllPackItems(await firebase.getPackItemsForAllPackingLists());
    })().catch(setError);
  }, [setError]);

  useMemo(() => {
    setReordered(initialPackingLists);
  }, [initialPackingLists]);

  useMemo(() => {
    const groups: PackingListWithItems[] = [];
    for (const packingList of reordered) {
      const group: PackingListWithItems = { packingList, packItems: [] };
      for (const packItem of allPackItems) {
        if (packItem.packingList === packingList.id) {
          group.packItems.push(packItem);
        }
      }
      groups.push(group);
    }
    setPackingListsWithItems(groups);
  }, [reordered, allPackItems]);

  async function OnNewList() {
    const name = findUniqueName('My packing list', reordered);
    const rank = rankOnTop(reordered);
    await firebase.addPackingList(name, rank);
  }

  function dragEnd(result: DropResult) {
    return reorderAndSave(result, firebase.updatePackingLists, reordered, setReordered);
  }

  return (
    <DragDropContext onDragEnd={dragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <Flex wrap="wrap" direction="column" {...provided.droppableProps} ref={provided.innerRef} m={2}>
            <Button onClick={OnNewList} my={2}>
              Create new
            </Button>
            {packingListsWithItems.map(({ packingList, packItems }, index) => (
              <Draggable key={packingList.id} draggableId={packingList.id} index={index}>
                {(provided, snapshot) => (
                  <PackingListCard
                    key={packingList.id}
                    packingList={packingList}
                    isCurrentList={packingList.id === currentList.id}
                    packItems={packItems}
                    draggableProvided={provided}
                    draggableSnapshot={snapshot}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Flex>
        )}
      </Droppable>
    </DragDropContext>
  );
}
