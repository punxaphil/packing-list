import { Box, HStack, Spacer, Stack, useDisclosure, useToast } from '@chakra-ui/react';
import { AiOutlineCopy, AiOutlineDelete } from 'react-icons/ai';
import { useNavigate } from 'react-router';
import { firebase } from '../../services/firebase.ts';
import { findUniqueName } from '../../services/utils.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { DeleteDialog } from './DeleteDialog.tsx';
import { PLIconButton } from './PLIconButton.tsx';

export function PackingListCard({
  isCurrentList,
  packItems,
  packingList,
}: {
  isCurrentList: boolean;
  packItems: PackItem[];
  packingList: NamedEntity;
}) {
  const deleteDialog = useDisclosure();
  const navigate = useNavigate();
  const { packingLists, groupedPackItems } = useFirebase();
  const { setPackingListId } = usePackingListId();
  const toast = useToast();

  function onListClick() {
    setPackingListId(packingList.id);
    navigate('/');
  }

  function onDelete() {
    if (packingLists.length === 1) {
      showToast('Cannot delete last packing list');
    } else {
      deleteDialog.onOpen();
    }
  }

  async function confirmDelete() {
    const batch = firebase.initBatch();
    for (const packItem of packItems) {
      firebase.deletePackItemBatch(packItem.id, batch);
    }
    firebase.deletePackingListBatch(packingList.id, batch);
    await batch.commit();
    const filtered = packingLists.filter((l) => l.id !== packingList.id);
    const selectedPackingList = filtered[0];
    setPackingListId(selectedPackingList.id);
  }

  function showToast(description: string) {
    toast({
      title: 'Delete failed.',
      description: description,
      status: 'error',
      duration: 9000,
      isClosable: true,
    });
  }

  async function onCopy() {
    if (!groupedPackItems) {
      throw new Error('Grouped pack items not loaded');
    }
    const name = findUniqueName(`${packingList.name} - Copy`, packingLists);
    const batch = firebase.initBatch();
    const packingListId = firebase.addPackingListBatch(name, batch);
    for (const packItem of packItems) {
      firebase.addPackItemBatch(
        batch,
        packItem.name,
        packItem.members,
        packItem.category,
        packItem.rank,
        packingListId
      );
    }
    await batch.commit();
    toast({
      title: 'Packing list copied',
      description: `'${name}' created from '${packingList.name}'`,
      status: 'success',
      duration: 9000,
    });
  }

  return (
    <Stack
      boxShadow={isCurrentList ? 'lg' : 'md'}
      p={2}
      paddingBottom={0}
      m={2}
      borderRadius="md"
      width="200px"
      borderWidth={isCurrentList ? '3px' : '1px'}
    >
      <Box onClick={onListClick} cursor="pointer">
        <Box fontWeight="bold">{packingList.name}</Box>
        <Box>
          {packItems.slice(0, 5).map((item, index) => {
            return (
              <Box key={item.id} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                {index === 4 ? '...' : item.name}
              </Box>
            );
          })}
        </Box>
      </Box>
      <Spacer />
      <HStack justifyContent="flex-end" gap="0">
        <PLIconButton onClick={onDelete} icon={<AiOutlineDelete />} aria-label="Delete packing list" size={'sm'} />
        <PLIconButton onClick={onCopy} icon={<AiOutlineCopy />} aria-label="Copy packing list" size={'sm'} />
      </HStack>
      <DeleteDialog
        text={`packing list ${packingList.name}${packItems.length ? ` with ${packItems.length} items` : ''}`}
        onConfirm={confirmDelete}
        onClose={deleteDialog.onClose}
        isOpen={deleteDialog.isOpen}
      />
    </Stack>
  );
}
