import { MenuItem } from '@chakra-ui/icons';
import { useDisclosure, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiOutlineCopy, AiOutlineDelete, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { TbStatusChange } from 'react-icons/tb';
import { DeleteDialog } from '~/components/shared/DeleteDialog.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useTemplate } from '~/providers/TemplateContext.ts';
import { useUndo } from '~/providers/UndoContext.ts';
import { writeDb } from '~/services/database.ts';
import { PackItem } from '~/types/PackItem.ts';
import { CategoryModal } from './CategoryModal.tsx';
import { ConnectMembersToPackItemModal } from './ConnectMembersToPackItemModal.tsx';
import { ContextMenu } from './ContextMenu.tsx';
import { CopyToOtherListModal } from './CopyToOtherListModal.tsx';

export function PackItemMenu({ packItem }: { packItem: PackItem }) {
  const { packingLists } = useDatabase();
  const { addUndoAction } = useUndo();
  const { getSyncDecision, setSyncDecision, getMatchingItemsForSync, isTemplateList, refreshTemplateItems } =
    useTemplate();
  const copyDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const moveDisclosure = useDisclosure();
  const membersDisclosure = useDisclosure();
  const toast = useToast();
  const [hasMatchingItems, setHasMatchingItems] = useState(false);

  useEffect(() => {
    async function checkMatchingItems() {
      const matchingItems = await getMatchingItemsForSync(packItem);
      setHasMatchingItems(matchingItems.length > 0);
    }
    checkMatchingItems();
  }, [packItem, getMatchingItemsForSync]);

  async function syncDelete() {
    const matchingItems = await getMatchingItemsForSync(packItem);
    if (matchingItems.length > 0) {
      const batch = writeDb.initBatch();
      for (const item of matchingItems) {
        writeDb.deletePackItemBatch(item.id, batch);
      }
      await batch.commit();
      if (isTemplateList(packItem.packingList)) {
        await refreshTemplateItems();
      }
    }
  }

  function handleSyncDecisionMade(shouldSync: boolean, remember: boolean) {
    setSyncDecision('delete', shouldSync, remember);
  }

  async function onConfirmDelete(shouldSync: boolean) {
    const deletedItem = { ...packItem };
    await writeDb.deletePackItem(packItem.id);

    addUndoAction({
      type: 'delete-pack-item',
      description: `Deleted item ${packItem.name}`,
      data: { items: [deletedItem] },
    });

    toast({
      title: `Deleted item ${packItem.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    const savedDecision = getSyncDecision('delete');
    const shouldActuallySync = savedDecision !== null ? savedDecision : shouldSync;

    if (shouldActuallySync) {
      await syncDelete();
    }
  }

  const showSyncInDialog = hasMatchingItems && getSyncDecision('delete') === null;

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
        syncOptions={
          showSyncInDialog
            ? {
                showSync: true,
                isTemplateChange: isTemplateList(packItem.packingList),
                onSyncDecisionMade: handleSyncDecisionMade,
              }
            : undefined
        }
      />
      <CategoryModal isOpen={moveDisclosure.isOpen} onClose={moveDisclosure.onClose} packItem={packItem} />
      <ConnectMembersToPackItemModal
        isOpen={membersDisclosure.isOpen}
        onClose={membersDisclosure.onClose}
        packItem={packItem}
      />
    </ContextMenu>
  );
}
