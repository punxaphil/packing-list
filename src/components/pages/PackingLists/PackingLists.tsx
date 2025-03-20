import { Button, Card, CardBody, Flex, Spacer, useToast } from '@chakra-ui/react';
import { DragDropContext, Draggable, DropResult, Droppable } from '@hello-pangea/dnd';
import { useEffect, useMemo, useState } from 'react';
import { PackingListCard } from '~/components/pages/PackingLists/PackingListCard.tsx';
import { useApi } from '~/providers/ApiContext.ts';
import { useError } from '~/providers/ErrorContext.ts';
import { useModel } from '~/providers/ModelContext.ts';
import { reorderAndSave } from '~/services/reorderUtils.ts';
import { findUniqueName, rankOnTop } from '~/services/utils.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import { PackingListWithItems } from '~/types/PackingListsWithItems.ts';

export function PackingLists() {
  const [reordered, setReordered] = useState<NamedEntity[]>([]);
  const { packingLists: initialPackingLists, packingList: currentList } = useModel();
  const { api } = useApi();
  const [packingListsWithItems, setPackingListsWithItems] = useState<PackingListWithItems[]>([]);
  const [allPackItems, setAllPackItems] = useState<PackItem[]>([]);
  const { setError } = useError();
  const toast = useToast();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      setAllPackItems(await api.getPackItemsForAllPackingLists());
      setInitialized(true);
    })().catch(setError);
  }, [setError, api]);

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
    await api.addPackingList(name, rank);
    toast({
      title: `Packing list "${name}" created`,
      status: 'success',
    });
  }

  function dragEnd(result: DropResult) {
    return reorderAndSave(result, api.updatePackingLists.bind(api), reordered, setReordered);
  }

  return (
    initialized && (
      <Flex m="5" minWidth={300}>
        <Spacer />
        <Card>
          <CardBody>
            <DragDropContext onDragEnd={dragEnd}>
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
                    <Button onClick={OnNewList} my={2}>
                      Create new Packing List
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
          </CardBody>
        </Card>
        <Spacer />
      </Flex>
    )
  );
}
