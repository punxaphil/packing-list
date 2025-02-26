import { Flex, IconButton, useToast } from '@chakra-ui/react';
import { AiOutlineCopy, AiOutlineDelete, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { TbStatusChange } from 'react-icons/tb';
import { firebase } from '../../services/firebase.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { IconSelect } from '../shared/IconSelect.tsx';

const ICON_SIZE = 'sm';

export function PackItemRowControls({
  packItem,
  onUpdate,
}: {
  packItem: PackItem;
  onUpdate: (packItem: PackItem) => Promise<void>;
}) {
  const packingLists = useFirebase().packingLists;
  const categories = useFirebase().categories;
  const members = useFirebase().members;
  const toast = useToast();
  const { packingListId, setPackingListId } = usePackingListId();

  async function setCategory(id: string) {
    packItem.category = id;
    await onUpdate(packItem);
  }

  const selectableCategories = [{ id: '', name: 'Remove from category' }, ...categories].filter((c) => {
    return c.id !== packItem.category;
  });
  const selectableMembers = members.filter((m) => {
    return !packItem.members.find((t) => t.id === m.id);
  });

  async function addMember(id: string) {
    packItem.members.push({ id, checked: false });
    await onUpdate(packItem);
  }

  async function copyToOtherList(id: string, name: string) {
    await firebase.addPackItem(packItem.name, packItem.members, packItem.category ?? '', id, packItem.rank);
    toast({
      title: `${packItem.name} copied to ${name}`,
      status: 'success',
    });
    setPackingListId(packingListId);
  }

  async function deleteItem() {
    await firebase.deletePackItem(packItem.id);
  }

  return (
    <Flex alignItems="center">
      <IconSelect
        label="Move item to category"
        icon={<TbStatusChange />}
        items={selectableCategories}
        onClick={setCategory}
        size={ICON_SIZE}
      />
      <IconSelect
        label="Add members to pack item"
        icon={<AiOutlineUsergroupAdd />}
        items={selectableMembers}
        onClick={addMember}
        size={ICON_SIZE}
      />
      <IconSelect
        label="Copy to other list"
        icon={<AiOutlineCopy />}
        items={packingLists.filter((l) => l.id !== packItem.packingList)}
        onClick={copyToOtherList}
        size={ICON_SIZE}
      />
      <IconButton
        onClick={deleteItem}
        variant="ghost"
        icon={<AiOutlineDelete />}
        aria-label="Delete item"
        size={ICON_SIZE}
      />
    </Flex>
  );
}
