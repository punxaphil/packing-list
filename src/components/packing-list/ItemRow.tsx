import { PackItem } from '../../types/PackItem.ts';
import { getName } from '../../services/utils.ts';
import { MemberItemRow } from './MemberItemRow.tsx';
import { MultiCheckbox } from '../shared/MultiCheckbox.tsx';
import { Span } from '../shared/Span.tsx';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { Box, Flex, IconButton, Spacer } from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';

function ItemRow({ item, onEdit, indent }: { item: PackItem; onEdit: (item: PackItem) => void; indent?: boolean }) {
  const members = useFirebase().members;

  async function toggleItem() {
    item.checked = !item.checked;
    await firebase.updateItem(item);
  }

  async function onUpdate(item: PackItem) {
    await firebase.updateItem(item);
  }

  async function deleteItem() {
    await firebase.deleteItem(item.id);
  }

  const multipleMembers = !!(item.members && item.members.length > 1);
  const itemNameWithMember =
    item.name + (item.members?.length === 1 ? ` (${getName(members, item.members[0].id)})` : '');

  return (
    <Box ml={indent ? '3' : '0'}>
      <Flex gap="3" align="center">
        {multipleMembers ? (
          <MultiCheckbox item={item} onUpdate={onUpdate} />
        ) : (
          <PLCheckbox checked={item.checked} onClick={toggleItem} />
        )}

        <Span strike={item.checked}>{itemNameWithMember}</Span>
        <Spacer />
        <IconButton
          borderRadius="full"
          onClick={deleteItem}
          variant="ghost"
          icon={<DeleteIcon />}
          aria-label="Delete item"
        />
        <IconButton
          borderRadius="full"
          onClick={() => onEdit(item)}
          variant="ghost"
          icon={<EditIcon />}
          aria-label="Edit item"
        />
      </Flex>
      {multipleMembers && item.members?.map((m) => <MemberItemRow memberItem={m} parent={item} key={m.id} />)}
    </Box>
  );
}

export default ItemRow;
