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
  useDisclosure,
} from '@chakra-ui/react';
import { ReactNode, useState } from 'react';
import { ErrorContext, ErrorType } from './ErrorContext.ts';

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<ErrorType>('');
  const setErrorInternal = (error: ErrorType) => {
    setError(error);
    onToggle();
  };
  const { isOpen, onToggle, onClose } = useDisclosure();
  return (
    <ErrorContext
      value={{
        error: error,
        setError: setErrorInternal,
      }}
    >
      {children}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Error</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {Array.isArray(error) ? (
              error.map((e) => <Box key={e}>{e}</Box>)
            ) : typeof error === 'string' ? (
              <Box>{error}</Box>
            ) : (
              <Box>{error.message ?? JSON.stringify(error)}</Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ErrorContext>
  );
}
