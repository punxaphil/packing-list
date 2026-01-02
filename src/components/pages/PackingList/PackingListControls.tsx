import { Box, Button, Flex, Tooltip, useBreakpointValue, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
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
import { Search, SearchInput } from '~/components/pages/PackingList/Search.tsx';
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
  const { packItems, setFilter, filter } = useDatabase();
  const { fullscreenMode, setFullscreenMode } = useFullscreenMode();
  const {
    isSelectMode,
    setSelectMode,
    selectedItems,
    moveSelectedItemsToTop,
    moveSelectedItemsToBottom,
    clearSelection,
  } = useSelectMode();
  const { canUndo, performUndo, getUndoDescription, getFilteredHistory } = useUndo();
  const moveToCategoryDisclosure = useDisclosure();
  const deleteItemsDisclosure = useDisclosure();
  const deleteCheckedItemsDisclosure = useDisclosure();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const undoHistory = getFilteredHistory('packing-list');
  const checkedItems = packItems.filter((item) => item.checked);
  const checkedItemsCount = checkedItems.length;

  const hasActiveFilters =
    (filter?.showTheseCategories?.length ?? 0) > 0 ||
    (filter?.showTheseMembers?.length ?? 0) > 0 ||
    (filter?.showTheseStates?.length ?? 0) > 0 ||
    (filter?.searchText?.length ?? 0) > 0;

  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const showButtonText = useBreakpointValue({ base: false, md: true });
  const stickyBg = useColorModeValue('white', 'gray.800');

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
      searchText: filter?.searchText || '',
    });
    onMemberFilter(filterMembers);
  }

  function onSearch(searchText: string) {
    // Only update if search text actually changed
    if (filter?.searchText !== searchText) {
      setFilter({
        showTheseCategories: filter?.showTheseCategories || [],
        showTheseMembers: filter?.showTheseMembers || [],
        showTheseStates: filter?.showTheseStates || [],
        searchText,
      });
    }
  }

  function toggleSearch() {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      // Clear search when closing
      setFilter({
        showTheseCategories: filter?.showTheseCategories || [],
        showTheseMembers: filter?.showTheseMembers || [],
        showTheseStates: filter?.showTheseStates || [],
        searchText: '',
      });
    }
  }

  function onEditClick() {
    onTextMode();
  }

  function onFullscreen() {
    setFullscreenMode(!fullscreenMode);
  }

  async function handleUndo() {
    await performUndo('packing-list');
  }

  return (
    <Box mb={2} position="sticky" top={0} zIndex={10} bg={stickyBg} boxShadow="sm" py={2}>
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
        <>
          <Flex direction="row" justifyContent="space-between" alignItems="center" mb={1} wrap="wrap" gap={2}>
            <Flex justifyContent="space-between" width="100%">
              <Filter onFilter={onFilter} />
              <Flex>
                <Tooltip
                  label={
                    canUndo('packing-list')
                      ? `Undo: ${getUndoDescription('packing-list')} (${undoHistory.length} action${
                          undoHistory.length === 1 ? '' : 's'
                        } available)`
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
                      isDisabled={!canUndo('packing-list')}
                    />{' '}
                  </Box>
                </Tooltip>
                <Search onToggle={toggleSearch} isOpen={isSearchOpen} />
                <PLIconButton aria-label="Select mode" icon={<IoMdRadioButtonOn />} onClick={toggleSelectMode} mr={2} />
                <Tooltip label={hasActiveFilters ? 'Disable filters to use text mode' : ''} placement="bottom">
                  <Box>
                    <PLIconButton
                      aria-label="Edit"
                      icon={<AiOutlineEdit />}
                      onClick={onEditClick}
                      mr={2}
                      isDisabled={hasActiveFilters}
                    />
                  </Box>
                </Tooltip>
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
          {isSearchOpen && (
            <Box mt={2}>
              <SearchInput onSearch={onSearch} onClose={toggleSearch} initialValue={filter?.searchText || ''} />
            </Box>
          )}
        </>
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
