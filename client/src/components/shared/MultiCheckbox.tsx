import { Item } from '../../types/Item.tsx';
import { allChecked } from '../../services/utils.ts';
import { RiCheckboxMultipleLine } from '@react-icons/all-files/ri/RiCheckboxMultipleLine';
import { RiCheckboxMultipleBlankLine } from '@react-icons/all-files/ri/RiCheckboxMultipleBlankLine';
import { useItemsDispatch } from '../../services/contexts.ts';
import { ActionType } from '../../types/Action.tsx';

export function MultiCheckbox({ item }: { item: Item }) {
  const dispatch = useItemsDispatch();

  function checkAll() {
    item.checked = true;
    item.members?.forEach(t => t.checked = true);
    dispatch({
      type: ActionType.Changed,
      item,
    });
  }

  function uncheckAll() {
    item.checked = false;
    item.members?.forEach(t => t.checked = false);
    dispatch({
      type: ActionType.Changed,
      item,
    });
  }

  return allChecked(item) ?
    <RiCheckboxMultipleLine onClick={uncheckAll} /> :
    <RiCheckboxMultipleBlankLine onClick={checkAll} />;
}
