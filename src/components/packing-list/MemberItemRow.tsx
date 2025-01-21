import { MemberItem } from '../../types/MemberItem.tsx';
import { allChecked, getName } from '../../services/utils.ts';
import { Item } from '../../types/Item.tsx';
import { ActionType } from '../../types/Action.tsx';
import { useItemsDispatch, useMembers } from '../../services/contexts.ts';
import { Checkbox } from '../shared/Checkbox.tsx';
import { Span } from '../shared/Span.tsx';

export function MemberItemRow({
  memberItem,
  item,
}: {
  memberItem: MemberItem;
  item: Item;
}) {
  const dispatch = useItemsDispatch();
  const members = useMembers();

  function toggleMember(memberId: number) {
    const find = item.members?.find((t) => t.id === memberId);
    if (find) {
      find.checked = !find.checked;
      item.checked = allChecked(item);
      dispatch({
        type: ActionType.Changed,
        item,
      });
    }
  }

  return (
    <div key={memberItem.id} className="ml-5">
      <Checkbox
        checked={memberItem.checked}
        onClick={() => toggleMember(memberItem.id)}
      />
      <Span strike={memberItem.checked} className="ml-1">
        {getName(members, memberItem.id)}
      </Span>
    </div>
  );
}
