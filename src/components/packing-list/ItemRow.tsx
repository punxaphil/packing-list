import { PackItem } from '../../types/PackItem.ts';
import { getName } from '../../services/utils.ts';
import { MemberPackItemRow } from './MemberPackItemRow.tsx';
import { MultiCheckbox } from '../shared/MultiCheckbox.tsx';
import { Span } from '../shared/Span.tsx';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { Box, Flex, IconButton, Spacer } from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';

function ItemRow({
  packItem,
  onEdit,
  indent,
}: {
  packItem: PackItem;
  onEdit: (packItem: PackItem) => void;
  indent?: boolean;
}) {
  const members = useFirebase().members;

  async function toggleItem() {
    packItem.checked = !packItem.checked;
    await firebase.updatePackItem(packItem);
  }

  async function onUpdate(packItem: PackItem) {
    await firebase.updatePackItem(packItem);
  }

  async function deleteItem() {
    await firebase.deleteItem(packItem.id);
  }

  const multipleMembers = !!(packItem.members && packItem.members.length > 1);
  const itemNameWithMember =
    packItem.name + (packItem.members?.length === 1 ? ` (${getName(members, packItem.members[0].id)})` : '');

  return (
    <Box ml={indent ? '3' : '0'}>
      <Flex gap="3" align="center">
        {multipleMembers ? (
          <MultiCheckbox packItem={packItem} onUpdate={onUpdate} />
        ) : (
          <PLCheckbox checked={packItem.checked} onClick={toggleItem} />
        )}

        <Span strike={packItem.checked}>{itemNameWithMember}</Span>
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
          onClick={() => onEdit(packItem)}
          variant="ghost"
          icon={<EditIcon />}
          aria-label="Edit item"
        />
      </Flex>
      {multipleMembers &&
        packItem.members?.map((m) => <MemberPackItemRow memberItem={m} parent={packItem} key={m.id} />)}
    </Box>
  );
}

export default ItemRow;
