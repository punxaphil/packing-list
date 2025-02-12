import { Flex, Link, Stack } from '@chakra-ui/react';
import { AiOutlineEdit } from 'react-icons/ai';
import { MdLabelOutline } from 'react-icons/md';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { PackItem } from '../../types/PackItem.ts';
import { Filter } from '../shared/Filter.tsx';

export function PackingListControls({
  hidden,
  onTextMode,
  onFilterPackItems,
  onMemberFilter,
}: {
  hidden: boolean;
  onTextMode: () => void;
  onFilterPackItems: (packItems: PackItem[]) => void;
  onMemberFilter: (memberIds: string[]) => void;
}) {
  const packItems = useFirebase().packItems;
  const categories = useFirebase().categories;

  async function addCategory() {
    const batch = firebase.initBatch();
    const id = firebase.addCategoryBatch('My Category', batch);
    firebase.addPackItemBatch(batch, 'My Item', [], id);
    firebase.updateCategoryBatch(id, { rank: 0 }, batch);
    for (const category of categories) {
      firebase.updateCategoryBatch(category.id, { rank: (category.rank ?? 0) + 1 }, batch);
    }
    await batch.commit();
  }

  function onFilter(showTheseCategories: string[], showTheseMembers: string[]) {
    let filtered = !showTheseCategories.length
      ? packItems
      : packItems.filter((item) => showTheseCategories.includes(item.category ?? ''));
    filtered = !showTheseMembers.length
      ? filtered
      : filtered.filter((item) => {
          if (showTheseMembers.includes('') && item.members?.length === 0) {
            return true;
          }
          if (item.members?.length) {
            return item.members.some((m) => showTheseMembers.includes(m.id));
          }
        });
    onFilterPackItems(filtered);
    onMemberFilter(showTheseMembers);
  }

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" hidden={hidden}>
      <Filter onFilter={onFilter} />
      <Link color="teal" onClick={addCategory} variant="outline">
        <Flex alignItems="center" gap="1">
          <MdLabelOutline /> Add category
        </Flex>
      </Link>
      <Link color="teal" onClick={onTextMode} variant="outline" m="3">
        <Flex alignItems="center" gap="1">
          <AiOutlineEdit /> Text mode
        </Flex>
      </Link>
    </Stack>
  );
}
