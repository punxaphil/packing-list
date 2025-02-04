import { useState } from 'react';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../../services/contexts.ts';
import { Box, Card, CardBody, Text } from '@chakra-ui/react';
import PackItemRow from '../packing-list/ItemRow.tsx';
import { AddOrEditPackItem } from '../packing-list/AddOrEditPackItem.tsx';
import { groupByCategories } from '../../services/utils.ts';

export default function PackingList() {
  const [selectedItem, setSelectedItem] = useState<PackItem>();

  const packItems = useFirebase().packItems;
  const categories = useFirebase().categories;
  const grouped = groupByCategories(packItems);

  return (
    <Box mt="5">
      {packItems.length ? (
        <Card>
          <CardBody>
            {Object.entries(grouped).map(([groupCategory, packItems]) => (
              <Box key={groupCategory}>
                {groupCategory && (
                  <Box mt="5">
                    <Text as="b">{categories.find((cat) => cat.id === groupCategory)?.name ?? ''}</Text>
                  </Box>
                )}
                {packItems.map((packItem) => (
                  <PackItemRow
                    packItem={packItem}
                    key={packItem.id}
                    onEdit={setSelectedItem}
                    indent={!!groupCategory}
                  />
                ))}
              </Box>
            ))}
          </CardBody>
        </Card>
      ) : (
        'No items yet.'
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
