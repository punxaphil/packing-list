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
import { usePackingList } from '../providers/PackingListContext.ts';

export function CopyToOtherListModal({
  isOpen,
  onClose,
  packItemsInCat,
  category,
  packItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  packItemsInCat?: PackItem[];
  category?: NamedEntity;
  packItem?: PackItem;
}) {
  const packingLists = useFirebase().packingLists;
  const { packingList } = usePackingList();
  const toast = useToast();

  async function onClick(packingList: NamedEntity) {
    if (category && packItemsInCat) {
      await copyCategory(packItemsInCat, category, packingList);
      toast({
        title: `Category ${category.name} copied to ${packingList.name}`,
        status: 'success',
      });
    }
    if (packItem) {
      await firebase.addPackItem(packItem.name, packItem.members, packItem.category, packingList.id, packItem.rank);
      toast({
        title: `Pack item ${packItem.name} copied to ${packingList.name}`,
        status: 'success',
      });
    }
    onClose();
  }

  async function copyCategory(packItemsInCat: PackItem[], category: NamedEntity, packingList: NamedEntity) {
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
              .filter((l) => l.id !== packingList.id)
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
