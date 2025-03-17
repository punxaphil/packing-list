import { MenuItem } from '@chakra-ui/icons';
import { useDisclosure } from '@chakra-ui/react';
import { AiOutlineCopy, AiOutlineDelete, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { TbStatusChange } from 'react-icons/tb';
import { DeleteDialog } from '~/components/shared/DeleteDialog.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { PackItem } from '~/types/PackItem.ts';
import { ConnectMembersToPackItemModal } from './ConnectMembersToPackItemModal.tsx';
import { ContextMenu } from './ContextMenu.tsx';
import { CopyToOtherListModal } from './CopyToOtherListModal.tsx';
import { MoveToCategoryModal } from './MoveToCategoryModal.tsx';

export function PackItemMenu({
  packItem,
}: {
  packItem: PackItem;
}) {
  const { packingLists, dbInvoke } = useDatabase();
  const copyDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const moveDisclosure = useDisclosure();
  const membersDisclosure = useDisclosure();

  async function onConfirmDelete() {
    await dbInvoke.deletePackItem(packItem);
  }

  return (
    <ContextMenu title="Pack item actions">
      <MenuItem key="add" onClick={moveDisclosure.onOpen} icon={<TbStatusChange />}>
        Move item to category
      </MenuItem>
      <MenuItem key="copy" onClick={membersDisclosure.onOpen} icon={<AiOutlineUsergroupAdd />}>
        Add/remove members to pack item
      </MenuItem>
      {packingLists.length > 1 && (
        <MenuItem key="delete" onClick={copyDisclosure.onOpen} icon={<AiOutlineCopy />}>
          Copy to other list
        </MenuItem>
      )}
      <MenuItem key="color" onClick={deleteDisclosure.onOpen} icon={<AiOutlineDelete />}>
        Delete item
      </MenuItem>
      <CopyToOtherListModal isOpen={copyDisclosure.isOpen} onClose={copyDisclosure.onClose} packItem={packItem} />
      <DeleteDialog
        text={`item ${packItem.name}`}
        onConfirm={onConfirmDelete}
        onClose={deleteDisclosure.onClose}
        isOpen={deleteDisclosure.isOpen}
      />
      <MoveToCategoryModal isOpen={moveDisclosure.isOpen} onClose={moveDisclosure.onClose} packItem={packItem} />
      <ConnectMembersToPackItemModal
        isOpen={membersDisclosure.isOpen}
        onClose={membersDisclosure.onClose}
        packItem={packItem}
      />
    </ContextMenu>
  );
}
