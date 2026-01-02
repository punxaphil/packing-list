import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Checkbox,
} from '@chakra-ui/react';
import { RefObject, useRef, useState } from 'react';
import { useTemplate } from '~/providers/TemplateContext.ts';

interface AddSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shouldSync: boolean) => void;
  isTemplateChange: boolean;
  itemName: string;
}

export function AddSyncDialog({ isOpen, onClose, onConfirm, isTemplateChange, itemName }: AddSyncDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null) as RefObject<HTMLButtonElement>;
  const [shouldSync, setShouldSync] = useState(true);
  const [rememberDecision, setRememberDecision] = useState(false);
  const { setSyncDecision } = useTemplate();

  function handleConfirm() {
    setSyncDecision('add', shouldSync, rememberDecision);
    onConfirm(shouldSync);
    onClose();
  }

  const syncTarget = isTemplateChange ? 'all other lists' : 'the template';

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Added "{itemName}"
          </AlertDialogHeader>

          <AlertDialogBody>
            <Checkbox isChecked={shouldSync} onChange={(e) => setShouldSync(e.target.checked)}>
              Also add to {syncTarget}
            </Checkbox>
            <br />
            <Checkbox
              mt={2}
              size="sm"
              color="gray.500"
              isChecked={rememberDecision}
              onChange={(e) => setRememberDecision(e.target.checked)}
            >
              Remember my choice
            </Checkbox>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleConfirm} ml={3}>
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
