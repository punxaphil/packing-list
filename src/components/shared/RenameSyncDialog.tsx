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
import { useTemplate } from '~/providers/TemplateContext.ts';

interface RenameSyncDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shouldSync: boolean) => void;
  isTemplateChange: boolean;
  oldName: string;
  newName: string;
  listNames: string[];
}

export function RenameSyncDialog({
  isOpen,
  onClose,
  onConfirm,
  isTemplateChange,
  oldName,
  newName,
  listNames,
}: RenameSyncDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null) as RefObject<HTMLButtonElement>;
  const [shouldSync, setShouldSync] = useState(true);
  const [rememberDecision, setRememberDecision] = useState(false);
  const { setSyncDecision } = useTemplate();

  function handleConfirm() {
    setSyncDecision('rename', shouldSync, rememberDecision);
    onConfirm(shouldSync);
    onClose();
  }

  const syncTarget = isTemplateChange ? 'other lists' : 'template';

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Rename "{oldName}" to "{newName}"
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Also in: {listNames.join(', ')}
            </Text>
            <Checkbox isChecked={shouldSync} onChange={(e) => setShouldSync(e.target.checked)}>
              Rename in {syncTarget}
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
