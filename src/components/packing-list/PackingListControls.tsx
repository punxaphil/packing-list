import { Flex, HStack, Link, Spacer } from '@chakra-ui/react';
import { AiOutlineEdit, AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { useFullscreenMode } from '../providers/FullscreenModeContext.ts';
import { Filter } from '../shared/Filter.tsx';
import { PLIconButton } from '../shared/PLIconButton.tsx';

export function PackingListControls({
  onTextMode,
  onMemberFilter,
}: {
  onTextMode: () => void;
  onMemberFilter: (memberIds: string[]) => void;
}) {
  const setFilter = useFirebase().setFilter;
  const { fullscreenMode, setFullscreenMode } = useFullscreenMode();

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

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Filter onFilter={onFilter} />
      <Spacer />
      <Link onClick={onEditClick} variant="outline" m="3">
        <Flex alignItems="center" gap="1">
          <AiOutlineEdit />
        </Flex>
      </Link>
      <PLIconButton
        aria-label="Full screen"
        icon={fullscreenMode ? <AiOutlineFullscreenExit /> : <AiOutlineFullscreen />}
        onClick={onFullscreen}
      />
    </HStack>
  );
}
