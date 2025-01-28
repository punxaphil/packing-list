import { MemberItem } from '../../types/MemberItem.tsx';
import { allChecked, getName } from '../../services/utils.ts';
import { Item } from '../../types/Item.tsx';
import { ActionType } from '../../types/Action.tsx';
import { useItemsDispatch, useMembers } from '../../services/contexts.ts';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';
import { Span } from '../shared/Span.tsx';
import { Flex } from '@radix-ui/themes';

export function MemberItemRow({ memberItem, item }: { memberItem: MemberItem; item: Item }) {
  const dispatch = useItemsDispatch();
  const members = useMembers();

  function toggleMember(memberId: string) {
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
    <Flex pl="5" key={memberItem.id} gap="2" align="center">
      <PLCheckbox checked={memberItem.checked} onClick={() => toggleMember(memberItem.id)} />
      <Span strike={memberItem.checked}>{getName(members, memberItem.id)}</Span>
    </Flex>
  );
}
