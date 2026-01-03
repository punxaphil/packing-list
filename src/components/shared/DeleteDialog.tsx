import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Checkbox,
  Text,
} from '@chakra-ui/react';
import { RefObject, useRef, useState } from 'react';

interface SyncOptions {
  showSync: boolean;
  isTemplateChange: boolean;
  onSyncDecisionMade: (shouldSync: boolean, remember: boolean) => void;
}

export function DeleteDialog({
  text,
  onConfirm,
  onClose,
  isOpen,
  syncOptions,
}: {
  text: string;
  onConfirm: (shouldSync: boolean) => void | Promise<void>;
  onClose: () => void;
  isOpen: boolean;
  syncOptions?: SyncOptions;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null) as RefObject<HTMLButtonElement>;
  const [shouldSync, setShouldSync] = useState(false);
  const [rememberDecision, setRememberDecision] = useState(false);

  async function onDelete() {
    if (syncOptions?.showSync) {
      syncOptions.onSyncDecisionMade(shouldSync, rememberDecision);
    }
    await onConfirm(shouldSync);
    onClose();
  }

  const syncTarget = syncOptions?.isTemplateChange ? 'all other lists' : 'the template';

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete {text}
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text>Are you sure? You can use the undo button to reverse this action if needed.</Text>
            {syncOptions?.showSync && (
              <>
                <Checkbox mt={4} isChecked={shouldSync} onChange={(e) => setShouldSync(e.target.checked)}>
                  Also delete from {syncTarget}
                </Checkbox>
                <br />
                <Checkbox
                  mt={2}
                  isChecked={rememberDecision}
                  onChange={(e) => setRememberDecision(e.target.checked)}
                  size="sm"
                  color="gray.500"
                >
                  Remember my choice for this session
                </Checkbox>
              </>
            )}
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
