import { Box, Card, CardBody, Flex, Link, Spinner, Text, useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import { PackItemsTextMode } from '~/components/pages/PackingList/PackItemsTextMode.tsx';
import { PackingListColumns } from '~/components/pages/PackingList/PackingListColumns.tsx';
import { PackingListControls } from '~/components/pages/PackingList/PackingListControls.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { useSelectMode } from '~/providers/SelectModeContext.ts';
import { SelectModeProvider } from '~/providers/SelectModeProvider.tsx';
import { VersionProvider } from '~/providers/VersionProvider.tsx';
import { writeDb } from '~/services/database.ts';

function PackingListContent({
  filteredMembers,
  setFilteredMembers,
  textMode,
  setTextMode,
}: {
  filteredMembers: string[];
  setFilteredMembers: (members: string[]) => void;
  textMode: boolean;
  setTextMode: (value: boolean) => void;
}) {
  const { packItems, groupedPackItems, isLoadingPackItems, isFilterTransitioning } = useDatabase();
  const { isTransitioning } = useSelectMode();
  const { packingList } = usePackingList();
  const width = useBreakpointValue({ base: 320, sm: 400, md: 650, lg: 970 });

  async function addFirstPackItem() {
    await writeDb.addPackItem('Toothbrush', [], '', packingList.id, 0);
  }

  const showSpinner = isLoadingPackItems || isTransitioning || isFilterTransitioning;

  return (
    <Box mx="auto" width={width}>
      {!textMode && (
        <PackingListControls onTextMode={() => setTextMode(!textMode)} onMemberFilter={setFilteredMembers} />
      )}
      <Card mb="5">
        <CardBody>
          {showSpinner ? (
            <Flex justifyContent="center" py="8">
              <Spinner size="lg" />
            </Flex>
          ) : (
            <>
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
            </>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}

export function PackingList() {
  const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
  const [textMode, setTextMode] = useState(false);

  return (
    <VersionProvider>
      <SelectModeProvider>
        <PackingListContent
          filteredMembers={filteredMembers}
          setFilteredMembers={setFilteredMembers}
          textMode={textMode}
          setTextMode={setTextMode}
        />
      </SelectModeProvider>
    </VersionProvider>
  );
}
