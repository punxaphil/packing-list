import { Item } from '../../types/Item.tsx';
import { allChecked, allUnChecked } from '../../services/utils.ts';
import { useItemsDispatch } from '../../services/contexts.ts';
import { ActionType } from '../../types/Action.tsx';
import { Checkbox } from '@radix-ui/themes';

export function MultiCheckbox({ item }: { item: Item }) {
  const dispatch = useItemsDispatch();

  function checkAll() {
    item.checked = true;
    item.members?.forEach((t) => (t.checked = true));
    dispatch({
      type: ActionType.Changed,
      item,
    });
  }

  function uncheckAll() {
    item.checked = false;
    item.members?.forEach((t) => (t.checked = false));
    dispatch({
      type: ActionType.Changed,
      item,
    });
  }

  return allChecked(item) ? (
    <Checkbox checked={item.checked} onClick={uncheckAll} />
  ) : allUnChecked(item) ? (
    <Checkbox checked={item.checked} onClick={checkAll} />
  ) : (
    <Checkbox checked="indeterminate" onClick={checkAll} />
  );
}
