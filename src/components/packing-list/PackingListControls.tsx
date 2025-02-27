import { Flex, HStack, Link, Spacer } from '@chakra-ui/react';
import { AiOutlineEdit } from 'react-icons/ai';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { Filter } from '../shared/Filter.tsx';

export function PackingListControls({
  onTextMode,
  onMemberFilter,
}: {
  onTextMode: () => void;
  onMemberFilter: (memberIds: string[]) => void;
}) {
  const setFilter = useFirebase().setFilter;

  function onFilter(showTheseCategories: string[], showTheseMembers: string[], showTheseStates: string[]) {
    setFilter({ showTheseCategories, showTheseMembers, showTheseStates });

    onMemberFilter(showTheseMembers);
  }

  return (
    <HStack justifyContent="space-between" alignItems="center">
      <Filter onFilter={onFilter} />
      <Spacer />
      <Link onClick={onTextMode} variant="outline" m="3">
        <Flex alignItems="center" gap="1">
          <AiOutlineEdit /> Text mode
        </Flex>
      </Link>
    </HStack>
  );
}
