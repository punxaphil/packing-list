import { Item } from '../../types/Item.tsx';
import { useItemsDispatch, useMembers } from '../../services/contexts.ts';
import { ActionType } from '../../types/Action.tsx';
import { getName } from '../../services/utils.ts';
import { MemberItemRow } from './MemberItemRow.tsx';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';
import { MultiCheckbox } from '../shared/MultiCheckbox.tsx';
import { Span } from '../shared/Span.tsx';
import { Box, Flex, IconButton } from '@radix-ui/themes';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';

function ItemRow({ item, onEdit }: { item: Item; onEdit: (item: Item) => void }) {
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
    item.name + (item.members?.length === 1 ? ` (${getName(members, item.members[0].id)})` : '');

  return (
    <Box>
      <Flex gap="3" align="center">
        {multipleMembers ? <MultiCheckbox item={item} /> : <PLCheckbox checked={item.checked} onClick={toggleItem} />}

        <Span strike={item.checked}>{itemNameWithMember}</Span>
        <IconButton radius="full" onClick={onRemove} variant="ghost">
          <TrashIcon />
        </IconButton>
        <IconButton radius="full" onClick={() => onEdit(item)} variant="ghost">
          <Pencil1Icon />
        </IconButton>
      </Flex>
      {multipleMembers && item.members?.map((m) => <MemberItemRow memberItem={m} item={item} key={m.id} />)}
    </Box>
  );
}

export default ItemRow;
