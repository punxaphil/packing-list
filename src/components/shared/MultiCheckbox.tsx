import { Item } from '../../types/Item.ts';
import { allChecked, allUnChecked } from '../../services/utils.ts';
import { Checkbox } from '@radix-ui/themes';

export function MultiCheckbox({ item, onUpdate }: { item: Item; onUpdate: (item: Item) => void }) {
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

  return allChecked(item) ? (
    <Checkbox checked={item.checked} onClick={uncheckAll} />
  ) : allUnChecked(item) ? (
    <Checkbox checked={item.checked} onClick={checkAll} />
  ) : (
    <Checkbox checked="indeterminate" onClick={checkAll} />
  );
}
