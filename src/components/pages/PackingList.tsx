import { useEffect, useState } from 'react';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../../services/contexts.ts';
import { Box, Button, Card, CardBody, Flex, Spacer, Stack, Text } from '@chakra-ui/react';
import { AddOrEditPackItem } from '../packing-list/AddOrEditPackItem.tsx';
import { groupByCategories } from '../../services/utils.ts';
import { PLSelect } from '../shared/PLSelect.tsx';
import { EditIcon } from '@chakra-ui/icons';
import { PackItemRows } from '../packing-list/PackItemRows.tsx';
import { PackItemsTextMode } from '../packing-list/PackItemsTextMode.tsx';

export function PackingList() {
  const [selectedItem, setSelectedItem] = useState<PackItem>();
  const packItems = useFirebase().packItems;
  const [filteredPackItems, setFilteredPackItems] = useState(packItems);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [textMode, setTextMode] = useState(false);

  const categories = useFirebase().categories;
  const grouped = groupByCategories(filteredPackItems);

  useEffect(() => {
    setFilteredPackItems(packItems);
  }, [packItems]);

  function filterOnCategory(category: string) {
    if (category) {
      setFilteredPackItems(packItems.filter((packItem) => packItem.category === category));
    } else {
      setFilteredPackItems(packItems);
    }
    setFilterCategory(category);
  }

  return (
    <Box mt="5" maxWidth="600px" mx="auto">
      <>
        {/* Move to a separate component */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <PLSelect
            setSelection={filterOnCategory}
            selected={filterCategory}
            placeholder="Filter category"
            options={categories}
            hidden={textMode}
          />
          <Spacer />
          <Button onClick={() => setTextMode(!textMode)} hidden={textMode}>
            <EditIcon /> Text mode
          </Button>
        </Stack>
        {/* ---- */}
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
