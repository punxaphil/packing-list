import { Checkbox } from '@chakra-ui/react';
import { allChecked, allUnChecked } from '../../services/utils.ts';
import { PackItem } from '../../types/PackItem.ts';

export function MultiCheckbox({ packItem, onUpdate }: { packItem: PackItem; onUpdate: (item: PackItem) => void }) {
  function checkAll(checked: boolean) {
    packItem.checked = checked;
    const members = packItem.members;
    for (const t of members) {
      t.checked = checked;
    }
    onUpdate(packItem);
  }

  return (
    <Checkbox
      isIndeterminate={!allChecked(packItem) && !allUnChecked(packItem)}
      isChecked={packItem.checked}
      onChange={() => checkAll(!allChecked(packItem))}
    />
  );
}
