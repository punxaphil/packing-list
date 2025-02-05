import { useState } from 'react';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../../services/contexts.ts';
import { Box, Card, CardBody, Flex, Stack, Switch, Text } from '@chakra-ui/react';
import { AddOrEditPackItem } from '../packing-list/AddOrEditPackItem.tsx';
import { groupByCategories } from '../../services/utils.ts';
import { PLSelect } from '../shared/PLSelect.tsx';
import { EditIcon } from '@chakra-ui/icons';
import { PackItemRows } from '../packing-list/PackItemRows.tsx';
import { PackItemsBatchMode } from '../packing-list/PackItemsBatchMode.tsx';

export function PackingList() {
  const [selectedItem, setSelectedItem] = useState<PackItem>();
  const packItems = useFirebase().packItems;
  const [filteredPackItems, setFilteredPackItems] = useState(packItems);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [batchMode, setBatchMode] = useState(false);

  const categories = useFirebase().categories;
  const grouped = groupByCategories(filteredPackItems);

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
      {filteredPackItems.length ? (
        <>
          {/* Move to a separate component */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <PLSelect
              setSelection={filterOnCategory}
              selected={filterCategory}
              placeholder="Filter category"
              options={categories}
            />
            <Switch onChange={() => setBatchMode(!batchMode)} isChecked={batchMode}>
              <EditIcon /> Edit in batch?
            </Switch>
          </Stack>
          {/* ---- */}
          <Card>
            <CardBody>
              {batchMode ? (
                <PackItemsBatchMode grouped={grouped} />
              ) : (
                <PackItemRows grouped={grouped} setSelectedItem={setSelectedItem} />
              )}
            </CardBody>
          </Card>
        </>
      ) : (
        <Flex justifyContent="center" minWidth="max-content">
          <Text>No items yet.</Text>
        </Flex>
      )}
      <Card mt="5">
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
