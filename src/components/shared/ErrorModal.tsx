import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

export function ErrorModal({
  error,
  isOpen,
  onClose,
  onProceed,
}: {
  error: string | string[];
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
}) {
  function handleProceed() {
    onProceed();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Warning</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {Array.isArray(error) && error.map((e) => <Box key={e}>{e}</Box>)}
          {!Array.isArray(error) && <Box>{error}</Box>}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="red" onClick={handleProceed}>
            Proceed anyway
          </Button>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
