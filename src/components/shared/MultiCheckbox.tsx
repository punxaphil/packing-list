import { PackItem } from '../../types/PackItem.ts';
import { allChecked, allUnChecked } from '../../services/utils.ts';
import { Checkbox } from '@chakra-ui/react';

export function MultiCheckbox({ item, onUpdate }: { item: PackItem; onUpdate: (item: PackItem) => void }) {
  function checkAll() {
    item.checked = true;
    item.members?.forEach((t) => (t.checked = true));
    onUpdate(item);
  }

  function uncheckAll() {
    item.checked = false;
    item.members?.forEach((t) => (t.checked = false));
    onUpdate(item);
  }

  return (
    <Checkbox
      isIndeterminate={!allChecked(item) && !allUnChecked(item)}
      isChecked={item.checked}
      onChange={allChecked(item) ? uncheckAll : checkAll}
    />
  );
}
