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
import { useSelectMode } from '~/providers/SelectModeContext.ts';
import { writeDb } from '~/services/database.ts';

export function DeleteSelectedItemsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { selectedItems, clearSelection, setSelectMode } = useSelectMode();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  async function onConfirmDelete() {
    if (selectedItems.length === 0) {
      onClose();
      return;
    }

    const batch = writeDb.initBatch();

    for (const item of selectedItems) {
      writeDb.deletePackItemBatch(item.id, batch);
    }

    await batch.commit();

    toast({
      title: `Deleted ${selectedItems.length} items`,
      status: 'success',
    });

    // Clear selections and exit select mode after successful operation
    clearSelection();
    setSelectMode(false);
    onClose();
  }

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete {selectedItems.length} items
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure you want to delete {selectedItems.length} selected items? This action cannot be undone.
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
