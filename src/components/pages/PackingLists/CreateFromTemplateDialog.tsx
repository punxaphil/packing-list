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
import { useTemplate } from '~/providers/TemplateContext.ts';

interface CreateFromTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (useTemplate: boolean) => void;
}

export function CreateFromTemplateDialog({ isOpen, onClose, onConfirm }: CreateFromTemplateDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null) as RefObject<HTMLButtonElement>;
  const { templateList } = useTemplate();

  function handleConfirm(useTemplate: boolean) {
    onConfirm(useTemplate);
    onClose();
  }

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Create from template?
          </AlertDialogHeader>

          <AlertDialogBody>
            Would you like to create the new list based on the template "{templateList?.name}"?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => handleConfirm(false)}>
              Empty List
            </Button>
            <Button colorScheme="blue" onClick={() => handleConfirm(true)} ml={3}>
              Use Template
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
