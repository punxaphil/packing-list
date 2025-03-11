import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import { firebase } from '../../services/firebase.ts';
import { COLUMN_COLORS } from '../../types/Column.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';

export function MoveToCategoryModal({
  isOpen,
  onClose,
  packItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  packItem: PackItem;
}) {
  const categories = useFirebase().categories;
  const toast = useToast();

  async function onClick(category: NamedEntity) {
    const updatedPackItem = { ...packItem, category: category.id };
    await firebase.updatePackItem(updatedPackItem);
    toast({
      title: `Moved ${packItem.name} to ${category.name}`,
      status: 'success',
    });
    onClose();
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Move to category</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {categories
              .filter((l) => l.id !== packItem.category)
              .map((l, index) => (
                <Button key={l.id} onClick={() => onClick(l)} m="3" bg={COLUMN_COLORS[index % COLUMN_COLORS.length]}>
                  {l.name}
                </Button>
              ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
