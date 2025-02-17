import { Flex, IconButton, useToast } from '@chakra-ui/react';
import { ReactElement, useState } from 'react';
import { AiOutlineCopy, AiOutlineDelete, AiOutlineUserDelete, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { TbStatusChange } from 'react-icons/tb';
import { firebase } from '../../services/firebase.ts';
import { MemberPackItem } from '../../types/MemberPackItem.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { IconSelect } from '../shared/IconSelect.tsx';
import { InlineEdit } from '../shared/InlineEdit.tsx';
import { MultiCheckbox } from '../shared/MultiCheckbox.tsx';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';
import { MemberPackItemRow } from './MemberPackItemRow.tsx';
import { NewPackItemRow } from './NewPackItemRow.tsx';
import { PackItemRowWrapper } from './PackItemRowWrapper.tsx';

export function PackItemRow({
  packItem,
  filteredMembers,
  dragHandle,
  onFocus,
  showControls,
}: {
  packItem: PackItem;
  filteredMembers: string[];
  dragHandle: ReactElement;
  onFocus: () => void;
  showControls: boolean;
}) {
  const members = useFirebase().members;
  const categories = useFirebase().categories;
  const [addNewPackItem, setAddNewPackItem] = useState(false);
  const packingLists = useFirebase().packingLists;
  const toast = useToast();
  const { packingListId, setPackingListId } = usePackingListId();

  async function toggleItem() {
    packItem.checked = !packItem.checked;
    await onUpdate(packItem);
  }

  async function onUpdate(packItem: PackItem) {
    await firebase.updatePackItem(packItem);
  }

  async function deleteItem() {
    await firebase.deletePackItem(packItem.id);
  }

  function getMemberRows() {
    let filtered: MemberPackItem[];
    if (!filteredMembers.length) {
      filtered = packItem.members;
    } else {
      filtered = packItem.members.filter(({ id }) => filteredMembers.includes(id));
    }
    return (
      filtered.map((m) => {
        const member = members.find((t) => t.id === m.id);
        if (!member) {
          throw new Error(`Member with id ${m.id} not found`);
        }
        return {
          memberItem: m,
          member: member,
        };
      }) ?? []
    );
  }

  async function onChangeText(name: string) {
    packItem.name = name;
    await onUpdate(packItem);
  }

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

  async function onRemoveMembers() {
    packItem.members = [];
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

  const multipleMembers = packItem.members.length > 1;

  const memberRows = getMemberRows();

  return (
    <>
      <PackItemRowWrapper indent={!!packItem.category} bgColor={showControls ? 'gray.100' : 'white'}>
        <Flex gap="3" align="center">
          {dragHandle}
          {multipleMembers ? (
            <MultiCheckbox packItem={packItem} onUpdate={onUpdate} />
          ) : (
            <PLCheckbox checked={packItem.checked} onClick={toggleItem} />
          )}

          <Flex alignItems="center" grow="1">
            <InlineEdit
              value={packItem.name}
              onUpdate={onChangeText}
              strike={packItem.checked}
              onFocus={onFocus}
              onEnter={() => setAddNewPackItem(true)}
              grow={true}
            />
          </Flex>
          <Flex alignItems="center" hidden={!showControls}>
            <IconSelect
              label="Move item to category"
              icon={<TbStatusChange />}
              items={selectableCategories}
              onClick={setCategory}
            />
            <IconSelect
              label="Add members to pack item"
              icon={<AiOutlineUsergroupAdd />}
              items={selectableMembers}
              onClick={addMember}
            />
            <IconSelect
              label="Copy to other list"
              icon={<AiOutlineCopy />}
              items={packingLists.filter((l) => l.id !== packItem.packingList)}
              onClick={copyToOtherList}
            />
            <IconButton
              aria-label={'Remove member from pack item'}
              icon={<AiOutlineUserDelete />}
              onClick={onRemoveMembers}
              variant="ghost"
              hidden={packItem.members.length !== 1}
            />
            <IconButton onClick={deleteItem} variant="ghost" icon={<AiOutlineDelete />} aria-label="Delete item" />
          </Flex>
        </Flex>
        {memberRows.map(({ memberItem, member }) => (
          <MemberPackItemRow
            memberItem={memberItem}
            parent={packItem}
            key={memberItem.id + member.name}
            member={member}
            showControls={showControls}
          />
        ))}
      </PackItemRowWrapper>
      {addNewPackItem && <NewPackItemRow categoryId={packItem.category} onHide={() => setAddNewPackItem(false)} />}
    </>
  );
}
