import { Box, Button, HStack, Spacer, useDisclosure } from '@chakra-ui/react';
import {
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
  const { isSelectMode, setSelectMode, selectedItems } = useSelectMode();
  const moveToCategoryDisclosure = useDisclosure();
  const deleteItemsDisclosure = useDisclosure();

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
      <HStack justifyContent="space-between" alignItems="center" wrap="wrap" mb={1}>
        <Filter onFilter={onFilter} />
        <Spacer />

        {isSelectMode ? (
          <HStack>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<AiOutlineTags />}
              onClick={moveToCategoryDisclosure.onOpen}
              isDisabled={selectedItems.length === 0}
            >
              Category
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<AiOutlineDelete />}
              onClick={deleteItemsDisclosure.onOpen}
              isDisabled={selectedItems.length === 0}
            >
              Delete
            </Button>
            <Button size="sm" onClick={toggleSelectMode}>
              Exit select mode
            </Button>
          </HStack>
        ) : (
          <>
            <PLIconButton aria-label="Select mode" icon={<IoMdRadioButtonOn />} onClick={toggleSelectMode} mr={2} />
            <PLIconButton aria-label="Edit" icon={<AiOutlineEdit />} onClick={onEditClick} mr={2} />
            <PLIconButton
              aria-label="Full screen"
              icon={fullscreenMode ? <AiOutlineFullscreenExit /> : <AiOutlineFullscreen />}
              onClick={onFullscreen}
            />
          </>
        )}
      </HStack>

      <CategoryModal isOpen={moveToCategoryDisclosure.isOpen} onClose={moveToCategoryDisclosure.onClose} />

      <DeleteSelectedItemsModal isOpen={deleteItemsDisclosure.isOpen} onClose={deleteItemsDisclosure.onClose} />
    </Box>
  );
}
