import { ImCross } from '@react-icons/all-files/im/ImCross';

import { Item } from '../types/Item.tsx';
import { useItemsDispatch, useMembers } from '../services/contexts.ts';
import { ActionType } from '../types/Action.tsx';
import { getName } from '../services/utils.ts';
import { FaPen } from '@react-icons/all-files/fa/FaPen';
import { MemberItemRow } from './MemberItemRow.tsx';
import { Checkbox } from './Checkbox.tsx';
import { MultiCheckbox } from './MultiCheckbox.tsx';
import { Span } from './Span.tsx';

function ItemRow({
  item,
  onEdit,
}: {
  item: Item;
  onEdit: (item: Item) => void;
}) {
  const dispatch = useItemsDispatch();
  const members = useMembers();

  function toggleItem() {
    item.checked = !item.checked;
    dispatchChange(item);
  }

  function dispatchChange(item: Item) {
    dispatch({
      type: ActionType.Changed,
      item,
    });
  }

  function onRemove() {
    dispatch({
      type: ActionType.Deleted,
      item,
    });
  }

  const multipleMembers = !!(item.members && item.members.length > 1);
  const itemNameWithMember =
    item.name +
    (item.members?.length === 1
      ? ` (${getName(members, item.members[0].id)})`
      : '');
      
  return (
    <div>
      <div className="is-flex is-align-items-center">
        {multipleMembers ? (
          <MultiCheckbox item={item} />
        ) : (
          <Checkbox checked={item.checked} onClick={toggleItem} />
        )}

        <Span className="ml-1" strike={item.checked}>
          {itemNameWithMember}
        </Span>
        <ImCross onClick={onRemove} className="is-size-7 mx-1" />
        <FaPen onClick={() => onEdit(item)} className="is-size-7 mx-1" />
      </div>
      {multipleMembers &&
        item.members?.map((m) => (
          <MemberItemRow memberItem={m} item={item} key={m.id} />
        ))}
    </div>
  );
}

export default ItemRow;
