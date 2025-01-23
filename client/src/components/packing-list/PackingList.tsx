import ItemRow from './ItemRow.tsx';
import { useItems } from '../../services/contexts.ts';
import { Item } from '../../types/Item.tsx';
import { useState } from 'react';
import { AddOrEditItem } from './AddOrEditItem.tsx';

export default function PackingList() {
  const [selectedItem, setSelectedItem] = useState<Item>();
  return (
    <div className="box">
      {useItems().map((item) => (
        <ItemRow item={item} key={item.id} onEdit={setSelectedItem} />
      ))}
      <AddOrEditItem
        item={selectedItem}
        key={selectedItem?.id}
        cancel={() => setSelectedItem(undefined)}
      />
    </div>
  );
}
