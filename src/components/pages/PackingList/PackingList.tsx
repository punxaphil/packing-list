import { Box, Card, CardBody, Flex, Link, Text, useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import { PackItemsTextMode } from '~/components/pages/PackingList/PackItemsTextMode.tsx';
import { PackingListColumns } from '~/components/pages/PackingList/PackingListColumns.tsx';
import { PackingListControls } from '~/components/pages/PackingList/PackingListControls.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';

export function PackingList() {
  const { packItems, groupedPackItems, dbInvoke } = useDatabase();
  const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
  const [textMode, setTextMode] = useState(false);
  const { packingList } = usePackingList();
  const width = useBreakpointValue({ base: 320, sm: 400, md: 650, lg: 970 });

  async function addFirstPackItem() {
    await dbInvoke.addPackItem('Toothbrush', [], '', packingList.id, 0);
  }

  return (
    <Box mx="auto" width={width}>
      {!textMode && (
        <PackingListControls onTextMode={() => setTextMode(!textMode)} onMemberFilter={setFilteredMembers} />
      )}
      <Card mb="5">
        <CardBody>
          {textMode && <PackItemsTextMode onDone={() => setTextMode(false)} />}
          {!textMode && (
            <>
              {groupedPackItems.length > 0 && <PackingListColumns filteredMembers={filteredMembers} />}

              {groupedPackItems.length === 0 && (
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
