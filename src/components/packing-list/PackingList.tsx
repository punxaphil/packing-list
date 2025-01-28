import ItemRow from './ItemRow.tsx';
import { useItems } from '../../services/contexts.ts';
import { Item } from '../../types/Item.tsx';
import { useState } from 'react';
import { AddOrEditItem } from './AddOrEditItem.tsx';
import { Box, Card } from '@radix-ui/themes';

export default function PackingList() {
  const [selectedItem, setSelectedItem] = useState<Item>();
  return (
    <Box mt="5">
      <Card>
        {useItems().map((item) => (
          <ItemRow item={item} key={item.id} onEdit={setSelectedItem} />
        ))}
      </Card>

      <Card mt="5">
        <AddOrEditItem item={selectedItem} key={selectedItem?.id} cancel={() => setSelectedItem(undefined)} />
      </Card>
    </Box>
  );
}
