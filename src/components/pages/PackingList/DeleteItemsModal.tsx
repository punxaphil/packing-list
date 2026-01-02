import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { useUndo } from '~/providers/UndoContext.ts';
import { writeDb } from '~/services/database.ts';
import type { PackItem } from '~/types/PackItem.ts';

interface DeleteItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PackItem[];
  itemType: 'selected' | 'checked';
  onAfterDelete?: () => void;
}

export function DeleteItemsModal({ isOpen, onClose, items, itemType, onAfterDelete }: DeleteItemsModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { addUndoAction } = useUndo();
  const { packItems } = useDatabase();
  const { packingList } = usePackingList();
  const toast = useToast();

  async function onConfirmDelete() {
    if (items.length === 0) {
      onClose();
      return;
    }

    await writeDb.saveVersion(packingList.id, packItems, `Before deleting ${items.length} ${itemType} items`);

    const deletedItems = [...items];
    const itemCount = items.length;
    const batch = writeDb.initBatch();

    for (const item of items) {
      writeDb.deletePackItemBatch(item.id, batch);
    }

    onClose();
    await batch.commit();

    const actionType = itemType === 'checked' ? 'delete-checked-items' : 'delete-items';
    addUndoAction({
      type: actionType,
      description: `Deleted ${itemCount} ${itemType} items`,
      data: { items: deletedItems },
    });

    toast({
      title: `Deleted ${itemCount} ${itemType} items`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    onAfterDelete?.();
  }

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete {items.length} {itemType} items
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete {items.length} {itemType} items? You can use the undo button to reverse this
            action if needed.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={onConfirmDelete} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
