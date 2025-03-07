import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { findUniqueName } from '../../services/utils.ts';
import { PackingListWithItems } from '../../types/PackingListsWithItems.ts';
import { useError } from '../providers/ErrorContext.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { PackingListCard } from '../shared/PackingListCard.tsx';

export function PackingLists() {
  const { packingLists } = useFirebase();
  const [packingListsWithItems, setPackingListsWithItems] = useState<PackingListWithItems[]>([]);
  const currentList = usePackingListId().packingList;
  const { setError } = useError();

  useEffect(() => {
    (async () => {
      setPackingListsWithItems(await firebase.getPackingListsWithItems(packingLists));
    })().catch(setError);
  }, [packingLists, setError]);

  async function OnNewList() {
    const name = findUniqueName('My packing list', packingLists);
    await firebase.addPackingList(name);
  }

  return (
    <Flex wrap="wrap" direction="row" justifyContent="center">
      {packingListsWithItems.map(({ packingList, packItems }) => (
        <PackingListCard
          key={packingList.id}
          packingList={packingList}
          isCurrentList={packingList.id === currentList.id}
          packItems={packItems}
        />
      ))}
      <Button onClick={OnNewList} variant="outline" w="200px" h="220px" m={2}>
        <Stack>
          <Box fontSize="6xl">+</Box>
          <Box>Create new</Box>
        </Stack>
      </Button>
    </Flex>
  );
}
