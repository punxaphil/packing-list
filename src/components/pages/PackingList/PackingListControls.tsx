import { HStack, Spacer } from '@chakra-ui/react';
import { AiOutlineEdit, AiOutlineFullscreen, AiOutlineFullscreenExit, AiOutlineUndo } from 'react-icons/ai';
import { Filter } from '~/components/pages/PackingList/Filter.tsx';
import { PLIconButton } from '~/components/shared/PLIconButton.tsx';
import { useApi } from '~/providers/ApiContext.ts';
import { useFullscreenMode } from '~/providers/FullscreenModeContext.ts';
import { useModel } from '~/providers/ModelContext.ts';

export function PackingListControls({
  onTextMode,
  onMemberFilter,
}: {
  onTextMode: () => void;
  onMemberFilter: (memberIds: string[]) => void;
}) {
  const { setFilter } = useModel();
  const { api, changeHistory } = useApi();
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

  async function onUndo() {
    await api.undo();
  }

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Filter onFilter={onFilter} />
      <Spacer />
      <PLIconButton aria-label="Undo" icon={<AiOutlineUndo />} onClick={onUndo} disabled={changeHistory.length === 0} />
      <PLIconButton aria-label="Edit" icon={<AiOutlineEdit />} onClick={onEditClick} />
      <PLIconButton
        aria-label="Full screen"
        icon={fullscreenMode ? <AiOutlineFullscreenExit /> : <AiOutlineFullscreen />}
        onClick={onFullscreen}
      />
    </HStack>
  );
}
