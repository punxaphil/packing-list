import { Box, Card, CardBody, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useFirebase } from '../../services/contexts.ts';
import { groupByCategories } from '../../services/utils.ts';
import { PackItem } from '../../types/PackItem.ts';
import { AddOrEditPackItem } from '../packing-list/AddOrEditPackItem.tsx';
import { PackItemRows } from '../packing-list/PackItemRows.tsx';
import { PackItemsTextMode } from '../packing-list/PackItemsTextMode.tsx';
import { PackingListControls } from '../packing-list/PackingListControls.tsx';

export function PackingList() {
  const [selectedItem, setSelectedItem] = useState<PackItem>();
  const packItems = useFirebase().packItems;
  const [filteredPackItems, setFilteredPackItems] = useState(packItems);
  const [textMode, setTextMode] = useState(false);

  const grouped = groupByCategories(filteredPackItems);

  useEffect(() => {
    setFilteredPackItems(packItems);
  }, [packItems]);

  return (
    <Box mt="5" maxWidth="600px" mx="auto">
      <>
        <PackingListControls
          hidden={textMode}
          onFilterChanged={setFilteredPackItems}
          onClick={() => setTextMode(!textMode)}
        />
        <Card>
          <CardBody>
            <PackItemsTextMode grouped={grouped} onDone={() => setTextMode(false)} hidden={!textMode} />
            <PackItemRows
              grouped={grouped}
              setSelectedItem={setSelectedItem}
              hidden={textMode || !filteredPackItems.length}
            />
            <Flex justifyContent="center" minWidth="max-content" hidden={textMode || !!filteredPackItems.length}>
              <Text>No items yet.</Text>
            </Flex>
          </CardBody>
        </Card>
      </>
      <Card mt="5" hidden={textMode}>
        <CardBody>
          <AddOrEditPackItem
            packItem={selectedItem}
            key={selectedItem?.id ?? Date.now()}
            done={() => setSelectedItem(undefined)}
          />
        </CardBody>
      </Card>
    </Box>
  );
}
