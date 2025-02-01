import ItemRow from './ItemRow.tsx';
import { useFirebase } from '../../services/contexts.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useState } from 'react';
import { AddOrEditItem } from './AddOrEditItem.tsx';
import { Box, Card, CardBody, Text } from '@chakra-ui/react';

export default function PackingList() {
  const [selectedItem, setSelectedItem] = useState<PackItem>();
  const items = useFirebase().items;
  const categories = useFirebase().categories;
  const grouped = groupByCategories(items);

  return (
    <Box mt="5">
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
