import { Box, Card, CardBody, Flex, Link, Text, useMediaQuery } from '@chakra-ui/react';
import { useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { PackItemsTextMode } from '../packing-list/PackItemsTextMode.tsx';
import { PackingListColumns } from '../packing-list/PackingListColumns.tsx';
import { PackingListControls } from '../packing-list/PackingListControls.tsx';
import { MEDIA_QUERIES } from '../packing-list/packingListUtils.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';

export function PackingList() {
  const packItems = useFirebase().packItems;
  const grouped = useFirebase().groupedPackItems;
  const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
  const [textMode, setTextMode] = useState(false);
  const { packingListId } = usePackingListId();

  async function addFirstPackItem() {
    await firebase.addPackItem('Toothbrush', [], '', packingListId, 0);
  }
  const [isMin800px, isMin1200px] = useMediaQuery(MEDIA_QUERIES);

  return (
    <Box mx="auto" width={isMin1200px ? '1200px' : isMin800px ? '800px' : '400px'}>
      {!textMode && (
        <PackingListControls onTextMode={() => setTextMode(!textMode)} onMemberFilter={setFilteredMembers} />
      )}
      <Card mb="5">
        <CardBody>
          {textMode && <PackItemsTextMode onDone={() => setTextMode(false)} />}
          {!textMode && (
            <>
              {grouped.length > 0 && <PackingListColumns filteredMembers={filteredMembers} />}

              {grouped.length === 0 && (
                <Flex justifyContent="center" minWidth="max-content">
                  <Text>
                    {packItems.length > 0 ? (
                      'No items match the current filter.'
                    ) : (
                      <>
                        No items yet. <Link onClick={addFirstPackItem}>Click here to add one!</Link>
                      </>
                    )}
                  </Text>
                </Flex>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
