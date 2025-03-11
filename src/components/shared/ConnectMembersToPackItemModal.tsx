import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { firebase } from '../../services/firebase.ts';
import { COLUMN_COLORS } from '../../types/Column.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';

export function ConnectMembersToPackItemModal({
  isOpen,
  onClose,
  packItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  packItem: PackItem;
}) {
  const members = useFirebase().members;
  const toast = useToast();

  async function onClick(member: NamedEntity) {
    const memberIsInPackItem = packItem.members.some((m) => m.id === member.id);
    let title: string;
    if (memberIsInPackItem) {
      packItem.members = packItem.members.filter((m) => m.id !== member.id);
      title = `Removed ${member.name} from ${packItem.name}`;
    } else {
      packItem.members.push({ id: member.id, checked: false });
      title = `Added ${member.name} to ${packItem.name}`;
    }
    await firebase.updatePackItem(packItem);
    toast({
      title: title,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect members to pack item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack direction="row" flexWrap="wrap" justifyContent="center">
              {members.map((l, index) => {
                const memberIsInPackItem = packItem.members.some((m) => m.id === l.id);
                const color = COLUMN_COLORS[index % COLUMN_COLORS.length];
                return (
                  <Button
                    key={l.id}
                    onClick={() => onClick(l)}
                    m="3"
                    bg={memberIsInPackItem ? color : ''}
                    borderColor={memberIsInPackItem ? 'black' : color}
                    borderWidth={memberIsInPackItem ? 2 : 4}
                  >
                    {l.name}
                  </Button>
                );
              })}
            </Stack>
            <Button onClick={onClose} w={'100%'}>
              Done
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
