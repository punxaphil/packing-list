import { Flex, HStack, Link, Spacer } from '@chakra-ui/react';
import { AiOutlineEdit } from 'react-icons/ai';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { Filter } from '../shared/Filter.tsx';

export function PackingListControls({
  onTextMode,
  onPackItemsFilter,
  onMemberFilter,
}: {
  onTextMode: () => void;
  onPackItemsFilter: (packItems: PackItem[]) => void;
  onMemberFilter: (memberIds: string[]) => void;
}) {
  const packItems = useFirebase().packItems;

  function onFilter(showTheseCategories: string[], showTheseMembers: string[]) {
    let filtered = !showTheseCategories.length
      ? packItems
      : packItems.filter((item) => showTheseCategories.includes(item.category ?? ''));
    filtered = !showTheseMembers.length
      ? filtered
      : filtered.filter((item) => {
          if (showTheseMembers.includes('') && item.members.length === 0) {
            return true;
          }
          if (item.members.length) {
            return item.members.some((m) => showTheseMembers.includes(m.id));
          }
        });
    onPackItemsFilter(filtered);
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
