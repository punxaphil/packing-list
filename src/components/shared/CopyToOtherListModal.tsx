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

export function CopyToOtherListModal({
  isOpen,
  onClose,
  packingListId,
  packItemsInCat,
  category,
}: {
  isOpen: boolean;
  onClose: () => void;
  packingListId: string;
  packItemsInCat: PackItem[];
  category: NamedEntity;
}) {
  const packingLists = useFirebase().packingLists;
  const toast = useToast();

  async function onClick(packingList: NamedEntity) {
    const batch = firebase.initBatch();
    for (const packItem of packItemsInCat) {
      if (packItem.category === category.id) {
        firebase.addPackItemBatch(
          batch,
          packItem.name,
          packItem.members,
          packItem.category,
          packItem.rank,
          packingList.id
        );
      }
    }
    await batch.commit();
    onClose();
    toast({
      title: `Category ${category.name} copied to ${packingList.name}`,
      status: 'success',
    });
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Copy to packing list</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {packingLists
              .filter((l) => l.id !== packingListId)
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
