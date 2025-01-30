import ItemRow from './ItemRow.tsx';
import { useFirebase } from '../../services/contexts.ts';
import { Item } from '../../types/Item.ts';
import { useState } from 'react';
import { AddOrEditItem } from './AddOrEditItem.tsx';
import { Box, Card, Text } from '@radix-ui/themes';

export default function PackingList() {
  const [selectedItem, setSelectedItem] = useState<Item>();
  const items = useFirebase().items;
  const categories = useFirebase().categories;
  const grouped = groupByCategories(items);

  return (
    <Box mt="5">
      <Card>
        {Object.entries(grouped).map(([groupCategory, items]) => (
          <Box key={groupCategory}>
            {groupCategory && (
              <Box mt="5">
                <Text size="5" weight="bold">
                  {categories.find((cat) => cat.id === groupCategory)?.name ?? ''}
                </Text>
              </Box>
            )}
            {items.map((item) => (
              <ItemRow item={item} key={item.id} onEdit={setSelectedItem} indent={!!groupCategory} />
            ))}
          </Box>
        ))}
      </Card>

      <Card mt="5">
        <AddOrEditItem
          item={selectedItem}
          key={selectedItem?.id ?? Date.now()}
          done={() => setSelectedItem(undefined)}
        />
      </Card>
    </Box>
  );
}

function groupByCategories(items: Item[]) {
  return items.reduce(
    (acc, item) => {
      const category = item.category ?? '';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    { '': [] } as Record<string, Item[]>
  );
}
