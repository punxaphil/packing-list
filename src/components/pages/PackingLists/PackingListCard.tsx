import { Box, HStack, Spacer, Stack, useDisclosure, useToast } from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { AiOutlineCopy, AiOutlineDelete } from 'react-icons/ai';
import { useNavigate } from 'react-router';
import { DeleteDialog } from '~/components/shared/DeleteDialog.tsx';
import { DragHandle } from '~/components/shared/DragHandle.tsx';
import { PLIconButton } from '~/components/shared/PLIconButton.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { writeDb } from '~/services/database.ts';
import { findUniqueName, rankOnTop } from '~/services/utils.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';

export function PackingListCard({
  isCurrentList,
  packItems,
  packingList,
  draggableProvided,
  draggableSnapshot,
}: {
  isCurrentList: boolean;
  packItems: PackItem[];
  packingList: NamedEntity;
  draggableProvided: DraggableProvided;
  draggableSnapshot: DraggableStateSnapshot;
}) {
  const deleteDialog = useDisclosure();
  const navigate = useNavigate();
  const { packingLists, groupedPackItems } = useDatabase();
  const { setPackingListId } = usePackingList();
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
    const batch = writeDb.initBatch();
    for (const packItem of packItems) {
      writeDb.deletePackItemBatch(packItem.id, batch);
    }
    writeDb.deletePackingListBatch(packingList.id, batch);
    await batch.commit();
    const filtered = packingLists.filter((l) => l.id !== packingList.id);
    const selectedPackingList = filtered[0];
    setPackingListId(selectedPackingList.id);
    toast({
      title: `Packing list "${packingList.name}" deleted`,
      status: 'success',
    });
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
    const batch = writeDb.initBatch();
    const rank = rankOnTop(packingLists);
    const packingListId = writeDb.addPackingListBatch(name, batch, rank);
    for (const packItem of packItems) {
      writeDb.addPackItemBatch(batch, packItem.name, packItem.members, packItem.category, packItem.rank, packingListId);
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
      paddingBottom={0}
      my={2}
      borderRadius="md"
      borderWidth="1px"
      borderColor={isCurrentList ? 'black' : 'gray.200'}
      ref={draggableProvided.innerRef}
      {...draggableProvided.draggableProps}
      style={{
        ...draggableProvided.draggableProps.style,
      }}
      bg={draggableSnapshot.isDragging ? 'gray.100' : ''}
      width="100%"
    >
      <Box cursor="pointer" px={2}>
        <HStack gap="0">
          <DragHandle dragHandleProps={draggableProvided.dragHandleProps} />
          <Stack gap="0" flexGrow={1} overflow="hidden">
            <HStack gap="0">
              <Box
                fontWeight="bold"
                onClick={onListClick}
                flexGrow={1}
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                overflow="hidden"
              >
                {packingList.name}
              </Box>
              <Spacer />
              <PLIconButton onClick={onDelete} icon={<AiOutlineDelete />} aria-label="Delete packing list" size="sm" />
              <PLIconButton onClick={onCopy} icon={<AiOutlineCopy />} aria-label="Copy packing list" size="sm" />
            </HStack>
            <Box overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" onClick={onListClick}>
              {!packItems.length
                ? 'No items'
                : `${packItems.length} items (${packItems.filter((item) => item.checked).length} packed)`}
            </Box>
          </Stack>
        </HStack>
      </Box>
      <Spacer />
      <DeleteDialog
        text={`packing list ${packingList.name}${packItems.length ? ` with ${packItems.length} items` : ''}`}
        onConfirm={confirmDelete}
        onClose={deleteDialog.onClose}
        isOpen={deleteDialog.isOpen}
      />
    </Stack>
  );
}
