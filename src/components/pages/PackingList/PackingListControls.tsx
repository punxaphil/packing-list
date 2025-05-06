import { Box, Button, Flex, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
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
import { CategoryModal } from '~/components/pages/PackingList/CategoryModal.tsx';
import { DeleteSelectedItemsModal } from '~/components/pages/PackingList/DeleteSelectedItemsModal.tsx';
import { Filter } from '~/components/pages/PackingList/Filter.tsx';
import { PLIconButton } from '~/components/shared/PLIconButton.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useFullscreenMode } from '~/providers/FullscreenModeContext.ts';
import { useSelectMode } from '~/providers/SelectModeContext.ts';

export function PackingListControls({
  onTextMode,
  onMemberFilter,
}: {
  onTextMode: () => void;
  onMemberFilter: (memberIds: string[]) => void;
}) {
  const setFilter = useDatabase().setFilter;
  const { fullscreenMode, setFullscreenMode } = useFullscreenMode();
  const { isSelectMode, setSelectMode, selectedItems, moveSelectedItemsToTop, moveSelectedItemsToBottom } =
    useSelectMode();
  const moveToCategoryDisclosure = useDisclosure();
  const deleteItemsDisclosure = useDisclosure();
  // Determine button size based on screen size
  const buttonSize = useBreakpointValue({ base: 'xs', md: 'sm' });
  // Use icons only on very small screens
  const showButtonText = useBreakpointValue({ base: false, sm: true });

  function onFilter(showTheseCategories: string[], showTheseMembers: string[], showTheseStates: string[]) {
    setFilter({ showTheseCategories, showTheseMembers, showTheseStates });
    onMemberFilter(showTheseMembers);
  }

  function onFullscreen() {
    setFullscreenMode(!fullscreenMode);
  }

  function onEditClick() {
    setFilter({ showTheseCategories: [], showTheseMembers: [], showTheseStates: [] });
    onTextMode();
  }

  function toggleSelectMode() {
    setSelectMode(!isSelectMode);
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
              <PLIconButton aria-label="Select mode" icon={<IoMdRadioButtonOn />} onClick={toggleSelectMode} mr={2} />
              <PLIconButton aria-label="Edit" icon={<AiOutlineEdit />} onClick={onEditClick} mr={2} />
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
    </Box>
  );
}
