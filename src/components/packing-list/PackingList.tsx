import ItemRow from './ItemRow.tsx';
import { useFirebase } from '../../services/contexts.ts';
import { Item } from '../../types/Item.ts';
import { useState } from 'react';
import { AddOrEditItem } from './AddOrEditItem.tsx';
import { Box, Card } from '@radix-ui/themes';

export default function PackingList() {
  const [selectedItem, setSelectedItem] = useState<Item>();
  const items = useFirebase().items;
  return (
    <Box mt="5">
      <Card>
        {items.map((item) => (
          <ItemRow item={item} key={item.id} onEdit={setSelectedItem} />
        ))}
      </Card>

      <Card mt="5">
        <AddOrEditItem item={selectedItem} key={selectedItem?.id} cancel={() => setSelectedItem(undefined)} />
      </Card>
    </Box>
  );
}
