import { PackItem } from '../../types/PackItem.ts';
import { allChecked, allUnChecked } from '../../services/utils.ts';
import { Checkbox } from '@chakra-ui/react';

export function MultiCheckbox({ packItem, onUpdate }: { packItem: PackItem; onUpdate: (item: PackItem) => void }) {
  function checkAll() {
    packItem.checked = true;
    packItem.members?.forEach((t) => (t.checked = true));
    onUpdate(packItem);
  }

  function uncheckAll() {
    packItem.checked = false;
    packItem.members?.forEach((t) => (t.checked = false));
    onUpdate(packItem);
  }

  return (
    <Checkbox
      isIndeterminate={!allChecked(packItem) && !allUnChecked(packItem)}
      isChecked={packItem.checked}
      onChange={allChecked(packItem) ? uncheckAll : checkAll}
    />
  );
}
