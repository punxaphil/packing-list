import { Box, Card, CardBody, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useFirebase } from '../../services/contexts.ts';
import { groupByCategories } from '../../services/utils.ts';
import { PackItemRows } from '../packing-list/PackItemRows.tsx';
import { PackItemsTextMode } from '../packing-list/PackItemsTextMode.tsx';
import { PackingListControls } from '../packing-list/PackingListControls.tsx';

export function PackingList() {
  const packItems = useFirebase().packItems;
  const [filteredPackItems, setFilteredPackItems] = useState(packItems);
  const [textMode, setTextMode] = useState(false);

  const grouped = groupByCategories(filteredPackItems);

  useEffect(() => {
    setFilteredPackItems(packItems);
  }, [packItems]);

  return (
    <Box maxWidth="600px" mx="auto">
      <PackingListControls
        hidden={textMode}
        onFilterChanged={setFilteredPackItems}
        onClick={() => setTextMode(!textMode)}
      />
      <Card mb="5">
        <CardBody>
          <PackItemsTextMode grouped={grouped} onDone={() => setTextMode(false)} hidden={!textMode} />
          <PackItemRows grouped={grouped} hidden={textMode || !filteredPackItems.length} />
          <Flex justifyContent="center" minWidth="max-content" hidden={textMode || !!filteredPackItems.length}>
            <Text>No items yet.</Text>
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
}
