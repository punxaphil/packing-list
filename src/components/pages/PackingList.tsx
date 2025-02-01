import { useState } from 'react';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../../services/contexts.ts';
import { Box, Card, CardBody, Text } from '@chakra-ui/react';
import ItemRow from '../packing-list/ItemRow.tsx';
import { AddOrEditItem } from '../packing-list/AddOrEditItem.tsx';

export default function PackingList() {
  const [selectedItem, setSelectedItem] = useState<PackItem>();
  const items = useFirebase().items;
  const categories = useFirebase().categories;
  const grouped = groupByCategories(items);

  return (
    <Box mt="5">
       {items.length ? (
      <Card>
        <CardBody>
          {Object.entries(grouped).map(([groupCategory, items]) => (
            <Box key={groupCategory}>
              {groupCategory && (
                <Box mt="5">
                  <Text as="b">{categories.find((cat) => cat.id === groupCategory)?.name ?? ''}</Text>
                </Box>
              )}
              {items.map((item) => (
                <ItemRow item={item} key={item.id} onEdit={setSelectedItem} indent={!!groupCategory} />
              ))}
            </Box>
          ))}
        </CardBody>
      </Card>
       ) : ('No items yet.')}
      <Card mt="5">
        <CardBody>
          <AddOrEditItem
            item={selectedItem}
            key={selectedItem?.id ?? Date.now()}
            done={() => setSelectedItem(undefined)}
          />
        </CardBody>
      </Card>
    </Box>
  );
}

function groupByCategories(items: PackItem[]) {
  return items.reduce(
    (acc, item) => {
      const category = item.category ?? '';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    { '': [] } as Record<string, PackItem[]>
  );
}
