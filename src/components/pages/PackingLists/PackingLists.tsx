import { Button, Card, CardBody, Flex, Spacer, useToast } from '@chakra-ui/react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';
import { PackingListCard } from '~/components/pages/PackingLists/PackingListCard.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useError } from '~/providers/ErrorContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { writeDb } from '~/services/database.ts';
import { reorderAndSave } from '~/services/reorderUtils.ts';
import { findUniqueName, rankOnTop } from '~/services/utils.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import { PackingListWithItems } from '~/types/PackingListsWithItems.ts';

export function PackingLists() {
  const initialPackingListsFromDb = useDatabase().packingLists;
  const [displayPackingLists, setDisplayPackingLists] = useState<NamedEntity[]>(() => initialPackingListsFromDb ?? []);
  const [packingListsWithItems, setPackingListsWithItems] = useState<PackingListWithItems[]>([]);
  const [allPackItems, setAllPackItems] = useState<PackItem[]>([]);
  const currentList = usePackingList().packingList;
  const { setError } = useError();
  const toast = useToast();
  const [initialized, setInitialized] = useState(false);
  const [isDraggingOrSaving, setIsDraggingOrSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setAllPackItems(await writeDb.getPackItemsForAllPackingLists());
      setInitialized(true);
    })().catch(setError);
  }, [setError]);

  useEffect(() => {
    if (!isDraggingOrSaving && initialPackingListsFromDb) {
      setDisplayPackingLists(initialPackingListsFromDb);
    }
  }, [initialPackingListsFromDb, isDraggingOrSaving]);

  useEffect(() => {
    const groups: PackingListWithItems[] = [];
    for (const packingList of displayPackingLists) {
      const group: PackingListWithItems = { packingList, packItems: [] };
      for (const packItem of allPackItems) {
        if (packItem.packingList === packingList.id) {
          group.packItems.push(packItem);
        }
      }
      groups.push(group);
    }
    setPackingListsWithItems(groups);
  }, [displayPackingLists, allPackItems]);

  async function handleNewList() {
    const name = findUniqueName('My packing list', displayPackingLists);
    const rank = rankOnTop(displayPackingLists);
    await writeDb.addPackingList(name, rank);
    toast({
      title: `Packing list "${name}" created`,
      status: 'success',
    });
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }

    setIsDraggingOrSaving(true);

    try {
      await reorderAndSave(result, writeDb.updatePackingLists, displayPackingLists, setDisplayPackingLists);
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsDraggingOrSaving(false);
    }
  }

  return (
    initialized && (
      <Flex m="5" minWidth={300}>
        <Spacer />
        <Card>
          <CardBody>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="droppable">
                {(provided) => (
                  <Flex
                    wrap="wrap"
                    direction="column"
                    alignItems="center"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    m={2}
                    maxWidth={800}
                  >
                    <Button onClick={handleNewList} my={2}>
                      Create new Packing List
                    </Button>
                    {packingListsWithItems.map(({ packingList, packItems }, index) => (
                      <Draggable key={packingList.id} draggableId={packingList.id} index={index}>
                        {(draggableProvided, snapshot) => (
                          <PackingListCard
                            key={packingList.id}
                            packingList={packingList}
                            isCurrentList={packingList.id === currentList.id}
                            packItems={packItems}
                            draggableProvided={draggableProvided}
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
          </CardBody>
        </Card>
        <Spacer />
      </Flex>
    )
  );
}
