import { Item } from '../../types/Item.ts';
import { getName } from '../../services/utils.ts';
import { MemberItemRow } from './MemberItemRow.tsx';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';
import { MultiCheckbox } from '../shared/MultiCheckbox.tsx';
import { Span } from '../shared/Span.tsx';
import { Box, Flex, IconButton } from '@radix-ui/themes';
import { Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';

function ItemRow({ item, onEdit }: { item: Item; onEdit: (item: Item) => void }) {
  const members = useFirebase().members;

  async function toggleItem() {
    item.checked = !item.checked;
    await firebase.updateItem(item);
  }

  async function onUpdate(item: Item) {
    await firebase.updateItem(item);
  }

  async function deleteItem() {
    await firebase.deleteItem(item.id);
  }

  const multipleMembers = !!(item.members && item.members.length > 1);
  const itemNameWithMember =
    item.name + (item.members?.length === 1 ? ` (${getName(members, item.members[0].id)})` : '');

  return (
    <Box>
      <Flex gap="3" align="center">
        {multipleMembers ? (
          <MultiCheckbox item={item} onUpdate={onUpdate} />
        ) : (
          <PLCheckbox checked={item.checked} onClick={toggleItem} />
        )}

        <Span strike={item.checked}>{itemNameWithMember}</Span>
        <IconButton radius="full" onClick={deleteItem} variant="ghost">
          <TrashIcon />
        </IconButton>
        <IconButton radius="full" onClick={() => onEdit(item)} variant="ghost">
          <Pencil1Icon />
        </IconButton>
      </Flex>
      {multipleMembers && item.members?.map((m) => <MemberItemRow memberItem={m} parent={item} key={m.id} />)}
    </Box>
  );
}

export default ItemRow;
