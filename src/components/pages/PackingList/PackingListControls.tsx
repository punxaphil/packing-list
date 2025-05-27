import { Box, Button, Flex, Tooltip, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import {
  AiOutlineArrowDown,
  AiOutlineArrowUp,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineFullscreen,
  AiOutlineFullscreenExit,
  AiOutlineTags,
} from 'react-icons/ai';
import { IoMdRadioButtonOn } from 'react-icons/io';
import { MdOutlineRemoveDone, MdUndo } from 'react-icons/md';
import { CategoryModal } from '~/components/pages/PackingList/CategoryModal.tsx';
import { DeleteItemsModal } from '~/components/pages/PackingList/DeleteItemsModal.tsx';
import { DeleteSelectedItemsModal } from '~/components/pages/PackingList/DeleteSelectedItemsModal.tsx';
import { Filter } from '~/components/pages/PackingList/Filter.tsx';
import { PLIconButton } from '~/components/shared/PLIconButton.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useFullscreenMode } from '~/providers/FullscreenModeContext.ts';
import { useSelectMode } from '~/providers/SelectModeContext.ts';
import { useUndo } from '~/providers/UndoContext.ts';

export function PackingListControls({
  onTextMode,
  onMemberFilter,
}: {
  onTextMode: () => void;
  onMemberFilter: (memberIds: string[]) => void;
}) {
  const { packItems, setFilter } = useDatabase();
  const { fullscreenMode, setFullscreenMode } = useFullscreenMode();
  const {
    isSelectMode,
    setSelectMode,
    selectedItems,
    moveSelectedItemsToTop,
    moveSelectedItemsToBottom,
    clearSelection,
  } = useSelectMode();
  const { canUndo, performUndo, getUndoDescription, undoHistory } = useUndo();
  const moveToCategoryDisclosure = useDisclosure();
  const deleteItemsDisclosure = useDisclosure();
  const deleteCheckedItemsDisclosure = useDisclosure();

  const checkedItems = packItems.filter((item) => item.checked);
  const checkedItemsCount = checkedItems.length;

  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const showButtonText = useBreakpointValue({ base: false, md: true });

  function toggleSelectMode() {
    setSelectMode(!isSelectMode);
    if (isSelectMode) {
      clearSelection();
    }
  }

  function onFilter(filterCategories: string[], filterMembers: string[], filterPackItemState: string[]) {
    setFilter({
      showTheseCategories: filterCategories,
      showTheseMembers: filterMembers,
      showTheseStates: filterPackItemState,
    });
    onMemberFilter(filterMembers);
  }

  function onEditClick() {
    onTextMode();
  }

  function onFullscreen() {
    setFullscreenMode(!fullscreenMode);
  }

  async function handleUndo() {
    await performUndo();
  }

  return (
    <Box mb={2}>
      {isSelectMode ? (
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ base: 'stretch', md: 'center' }}
          my={1}
          gap={2}
        >
          <Flex
            wrap="wrap"
            gap={2}
            alignItems="center"
            justifyContent={{ base: 'flex-start', md: 'flex-end' }}
            width="100%"
          >
            <Button
              size={buttonSize}
              colorScheme="blue"
              leftIcon={<AiOutlineTags />}
              onClick={moveToCategoryDisclosure.onOpen}
              isDisabled={selectedItems.length === 0}
              flexGrow={{ base: 1, sm: 0 }}
            >
              {showButtonText ? 'Category' : ''}
            </Button>
            <Button
              size={buttonSize}
              colorScheme="teal"
              leftIcon={<AiOutlineArrowUp />}
              onClick={moveSelectedItemsToTop}
              isDisabled={selectedItems.length === 0}
              flexGrow={{ base: 1, sm: 0 }}
            >
              {showButtonText ? 'Move to Top' : ''}
            </Button>
            <Button
              size={buttonSize}
              colorScheme="teal"
              leftIcon={<AiOutlineArrowDown />}
              onClick={moveSelectedItemsToBottom}
              isDisabled={selectedItems.length === 0}
              flexGrow={{ base: 1, sm: 0 }}
            >
              {showButtonText ? 'Move to Bottom' : ''}
            </Button>
            <Button
              size={buttonSize}
              colorScheme="red"
              leftIcon={<AiOutlineDelete />}
              onClick={deleteItemsDisclosure.onOpen}
              isDisabled={selectedItems.length === 0}
              flexGrow={{ base: 1, sm: 0 }}
            >
              {showButtonText ? 'Delete' : ''}
            </Button>
            <Button size={buttonSize} onClick={toggleSelectMode} flexGrow={{ base: 1, sm: 0 }}>
              {showButtonText ? 'Exit select mode' : 'Exit'}
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Flex direction="row" justifyContent="space-between" alignItems="center" mb={1} wrap="wrap" gap={2}>
          <Flex justifyContent="space-between" width="100%">
            <Filter onFilter={onFilter} />
            <Flex>
              <Tooltip
                label={
                  canUndo
                    ? `Undo: ${getUndoDescription()} (${undoHistory.length} action${undoHistory.length === 1 ? '' : 's'} available)`
                    : 'No actions to undo'
                }
                placement="bottom"
              >
                <Box>
                  <PLIconButton
                    aria-label="Undo last action"
                    icon={<MdUndo />}
                    onClick={handleUndo}
                    mr={2}
                    isDisabled={!canUndo}
                  />
                </Box>
              </Tooltip>
              <PLIconButton aria-label="Select mode" icon={<IoMdRadioButtonOn />} onClick={toggleSelectMode} mr={2} />
              <PLIconButton aria-label="Edit" icon={<AiOutlineEdit />} onClick={onEditClick} mr={2} />
              <PLIconButton
                aria-label="Remove checked items"
                icon={<MdOutlineRemoveDone />}
                onClick={deleteCheckedItemsDisclosure.onOpen}
                mr={2}
                isDisabled={checkedItemsCount === 0}
              />
              <PLIconButton
                aria-label="Full screen"
                icon={fullscreenMode ? <AiOutlineFullscreenExit /> : <AiOutlineFullscreen />}
                onClick={onFullscreen}
              />
            </Flex>
          </Flex>
        </Flex>
      )}

      <CategoryModal isOpen={moveToCategoryDisclosure.isOpen} onClose={moveToCategoryDisclosure.onClose} />

      <DeleteSelectedItemsModal isOpen={deleteItemsDisclosure.isOpen} onClose={deleteItemsDisclosure.onClose} />

      <DeleteItemsModal
        isOpen={deleteCheckedItemsDisclosure.isOpen}
        onClose={deleteCheckedItemsDisclosure.onClose}
        items={checkedItems}
        itemType="checked"
      />
    </Box>
  );
}
