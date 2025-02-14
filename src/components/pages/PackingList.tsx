import { Box, Card, CardBody, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useFirebase } from '../../services/contexts.ts';
import { groupByCategories } from '../../services/utils.ts';
import { GroupedPackItem } from '../../types/GroupedPackItem.ts';
import { PackItem } from '../../types/PackItem.ts';
import { PackItemRows } from '../packing-list/PackItemRows.tsx';
import { PackItemsTextMode } from '../packing-list/PackItemsTextMode.tsx';
import { PackingListControls } from '../packing-list/PackingListControls.tsx';

export function PackingList() {
  const packItems = useFirebase().packItems;
  const categories = useFirebase().categories;
  const [filteredPackItems, setFilteredPackItems] = useState<PackItem[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<string[]>([]);
  const [textMode, setTextMode] = useState(false);
  const [grouped, setGrouped] = useState<GroupedPackItem[]>([]);

  useEffect(() => {
    const grouped = groupByCategories(filteredPackItems, categories);
    setFilteredPackItems(packItems);
    setGrouped(grouped);
  }, [categories, filteredPackItems, packItems]);

  return (
    <Box maxWidth="600px" mx="auto">
      <PackingListControls
        hidden={textMode}
        onFilterPackItems={setFilteredPackItems}
        onTextMode={() => setTextMode(!textMode)}
        onMemberFilter={setFilteredMembers}
      />
      <Card mb="5">
        <CardBody>
          <PackItemsTextMode grouped={grouped} onDone={() => setTextMode(false)} hidden={!textMode} />
          <PackItemRows
            grouped={grouped}
            filteredMembers={filteredMembers}
            hidden={textMode || !filteredPackItems.length}
          />
          <Flex justifyContent="center" minWidth="max-content" hidden={textMode || !!filteredPackItems.length}>
            <Text>No items yet.</Text>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
}
