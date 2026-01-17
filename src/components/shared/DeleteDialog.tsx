import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Text,
} from '@chakra-ui/react';
import { RefObject, useRef } from 'react';

export function DeleteDialog({
  text,
  onConfirm,
  onClose,
  isOpen,
  canUndo = false,
}: {
  text: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isOpen: boolean;
  canUndo?: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null) as RefObject<HTMLButtonElement>;

  async function onDelete() {
    await onConfirm();
    onClose();
  }

  const message = canUndo
    ? 'Are you sure? You can use the undo button to reverse this action.'
    : 'Are you sure? This cannot be undone.';

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete {text}
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text>{message}</Text>
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
  );
}
