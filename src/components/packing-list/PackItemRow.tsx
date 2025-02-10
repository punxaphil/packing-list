import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, Flex, IconButton, Spacer, Text } from '@chakra-ui/react';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { getName } from '../../services/utils.ts';
import { PackItem } from '../../types/PackItem.ts';
import { InlineEdit } from '../shared/InlineEdit.tsx';
import { MultiCheckbox } from '../shared/MultiCheckbox.tsx';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';
import { MemberPackItemRow } from './MemberPackItemRow.tsx';

export function PackItemRow({
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
    await firebase.deletePackItem(packItem.id);
  }

  const multipleMembers = !!(packItem.members && packItem.members.length > 1);
  const memberRows = packItem.members?.map((m) => {
    const member = members.find((t) => t.id === m.id);
    if (!member) {
      throw new Error(`Member with id ${m.id} not found`);
    }
    return {
      memberItem: m,
      member: member,
    };
  });

  async function onChangeText(name: string) {
    packItem.name = name;
    await firebase.updatePackItem(packItem);
  }

  return (
    <Box ml={indent ? '3' : '0'}>
      <Flex gap="3" align="center">
        {multipleMembers ? (
          <MultiCheckbox packItem={packItem} onUpdate={onUpdate} />
        ) : (
          <PLCheckbox checked={packItem.checked} onClick={toggleItem} />
        )}

        <Flex alignItems="center">
          <InlineEdit value={packItem.name} onUpdate={onChangeText} strike={packItem.checked} />
          <Text textDecoration={packItem.checked ? 'line-through' : 'none'} hidden={packItem.members?.length !== 1}>
            &nbsp;({getName(members, packItem.members?.[0]?.id)})
          </Text>
        </Flex>
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
      {!!memberRows &&
        memberRows.map(({ memberItem, member }) => (
          <MemberPackItemRow
            memberItem={memberItem}
            parent={packItem}
            key={memberItem.id + member.name}
            member={member}
          />
        ))}
    </Box>
  );
}
