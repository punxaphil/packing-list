import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  HStack,
  Spacer,
  Stack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useRef } from 'react';
import { AiOutlineCopy, AiOutlineDelete } from 'react-icons/ai';
import { TbArchive, TbArchiveOff, TbPin, TbPinnedOff, TbTemplate, TbTemplateOff } from 'react-icons/tb';
import { useNavigate } from 'react-router';
import { DeleteDialog } from '~/components/shared/DeleteDialog.tsx';
import { DragHandle } from '~/components/shared/DragHandle.tsx';
import { PLIconButton } from '~/components/shared/PLIconButton.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { useTemplate } from '~/providers/TemplateContext.ts';
import { useUndo } from '~/providers/UndoContext.ts';
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
  const replaceTemplateDialog = useDisclosure();
  const replaceTemplateCancelRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { packingLists, groupedPackItems } = useDatabase();
  const { setPackingListId } = usePackingList();
  const { addUndoAction } = useUndo();
  const { templateList } = useTemplate();
  const toast = useToast();

  const isTemplate = packingList.isTemplate === true;
  const isArchived = packingList.archived === true;
  const isPinned = packingList.pinned === true;

  async function onListClick() {
    if (isArchived) {
      toast({
        title: 'Archived list',
        description: 'Restore the list to edit it',
        status: 'info',
        duration: 3000,
      });
      return;
    }
    await setPackingListId(packingList.id);
    navigate('/');
  }

  function onDelete() {
    if (packingLists.length === 1) {
      showToast('Cannot delete last packing list');
    } else {
      deleteDialog.onOpen();
    }
  }

  async function deletePackingListAndItems() {
    const batch = writeDb.initBatch();
    for (const packItem of packItems) {
      writeDb.deletePackItemBatch(packItem.id, batch);
    }
    writeDb.deletePackingListBatch(packingList.id, batch);
    await batch.commit();
  }

  function switchToNextPackingList() {
    const filtered = packingLists.filter((l) => l.id !== packingList.id);
    const selectedPackingList = filtered[0];
    setPackingListId(selectedPackingList.id);
  }

  async function confirmDelete() {
    const deletedPackingList = { ...packingList };
    const deletedPackItems = [...packItems];

    await deletePackingListAndItems();
    switchToNextPackingList();

    addUndoAction({
      type: 'delete-packing-list',
      description: `Deleted packing list "${packingList.name}"`,
      data: { packingList: deletedPackingList, items: deletedPackItems },
    });

    toast({
      title: `Deleted packing list "${packingList.name}"`,
      status: 'success',
      duration: 3000,
      isClosable: true,
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

  async function toggleTemplate() {
    if (isTemplate) {
      await writeDb.updatePackingList({ ...packingList, isTemplate: false });
      toast({
        title: 'Template removed',
        description: `"${packingList.name}" is no longer a template`,
        status: 'info',
        duration: 3000,
      });
    } else if (templateList) {
      replaceTemplateDialog.onOpen();
    } else {
      await setAsTemplate();
    }
  }

  async function setAsTemplate() {
    if (templateList) {
      await writeDb.updatePackingList({ ...templateList, isTemplate: false });
    }
    await writeDb.updatePackingList({ ...packingList, isTemplate: true });
    toast({
      title: 'Template set',
      description: `"${packingList.name}" is now the template`,
      status: 'success',
      duration: 3000,
    });
    replaceTemplateDialog.onClose();
  }

  async function toggleArchive() {
    const newArchived = !isArchived;
    await writeDb.updatePackingList({ ...packingList, archived: newArchived });
    toast({
      title: newArchived ? 'List archived' : 'List restored',
      description: newArchived ? `"${packingList.name}" has been archived` : `"${packingList.name}" has been restored`,
      status: 'success',
      duration: 3000,
    });
  }

  async function togglePin() {
    const newPinned = !isPinned;
    await writeDb.updatePackingList({ ...packingList, pinned: newPinned });
    toast({
      title: newPinned ? 'List pinned' : 'List unpinned',
      description: newPinned
        ? `"${packingList.name}" is now pinned to top`
        : `"${packingList.name}" is no longer pinned`,
      status: 'success',
      duration: 3000,
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
      bg={draggableSnapshot.isDragging ? 'gray.100' : isArchived ? 'gray.50' : ''}
      opacity={isArchived ? 0.7 : 1}
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
                {isTemplate && (
                  <Badge ml={2} colorScheme="purple" fontSize="xs">
                    Template
                  </Badge>
                )}
                {isArchived && (
                  <Badge ml={2} colorScheme="gray" fontSize="xs">
                    Archived
                  </Badge>
                )}
              </Box>
              <Spacer />
              {!isArchived && (
                <PLIconButton
                  onClick={togglePin}
                  icon={isPinned ? <TbPinnedOff /> : <TbPin />}
                  aria-label={isPinned ? 'Unpin packing list' : 'Pin packing list'}
                  size="sm"
                  color={isPinned ? 'blue.500' : undefined}
                />
              )}
              {!isArchived && !isTemplate && (
                <PLIconButton
                  onClick={toggleArchive}
                  icon={<TbArchive />}
                  aria-label="Archive packing list"
                  size="sm"
                />
              )}
              {isArchived && (
                <PLIconButton
                  onClick={toggleArchive}
                  icon={<TbArchiveOff />}
                  aria-label="Restore packing list"
                  size="sm"
                />
              )}
              {!isArchived && (
                <PLIconButton
                  onClick={toggleTemplate}
                  icon={isTemplate ? <TbTemplateOff /> : <TbTemplate />}
                  aria-label={isTemplate ? 'Remove template' : 'Set as template'}
                  size="sm"
                  color={isTemplate ? 'purple.500' : undefined}
                />
              )}
              <PLIconButton onClick={onDelete} icon={<AiOutlineDelete />} aria-label="Delete packing list" size="sm" />
              {!isArchived && (
                <PLIconButton onClick={onCopy} icon={<AiOutlineCopy />} aria-label="Copy packing list" size="sm" />
              )}
            </HStack>
            <Box overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" onClick={onListClick}>
              {!packItems.length
                ? 'No items'
                : isTemplate
                  ? `${packItems.length} items`
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
      <AlertDialog
        isOpen={replaceTemplateDialog.isOpen}
        leastDestructiveRef={replaceTemplateCancelRef}
        onClose={replaceTemplateDialog.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Replace Template
            </AlertDialogHeader>
            <AlertDialogBody>
              Confirm that you want to use "{packingList.name}" as template list instead of "{templateList?.name}".
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={replaceTemplateCancelRef} onClick={replaceTemplateDialog.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => {
                  setAsTemplate();
                  replaceTemplateDialog.onClose();
                }}
                ml={3}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  );
}
