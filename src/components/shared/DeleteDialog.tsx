import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { RefObject, useRef } from 'react';

export function DeleteDialog({
  text,
  onConfirm,
  onClose,
  isOpen,
}: { text: string; onConfirm: () => void; onClose: () => void; isOpen: boolean }) {
  const cancelRef = useRef<HTMLButtonElement>(null) as RefObject<HTMLButtonElement>;

  function onDelete() {
    onConfirm();
    onClose();
  }

  return (
    <>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete {text}
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can use the undo button to reverse this action if needed.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
