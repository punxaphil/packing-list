import { DragHandleIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Spacer, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { AiOutlineDelete, AiOutlineUserDelete, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { TbStatusChange } from 'react-icons/tb';
import { firebase } from '../../services/firebase.ts';
import { getMemberName } from '../../services/utils.ts';
import { MemberPackItem } from '../../types/MemberPackItem.ts';
import { PackItem } from '../../types/PackItem.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
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
}: {
  packItem: PackItem;
  filteredMembers: string[];
}) {
  const members = useFirebase().members;
  const categories = useFirebase().categories;
  const [addNewPackItem, setAddNewPackItem] = useState(false);

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
  const multipleMembers = packItem.members.length > 1;
  const memberRows = getMemberRows();

  return (
    <>
      <PackItemRowWrapper indent={!!packItem.category}>
        <Flex gap="3" align="center">
          <DragHandleIcon color="gray.300" />
          {multipleMembers ? (
            <MultiCheckbox packItem={packItem} onUpdate={onUpdate} />
          ) : (
            <PLCheckbox checked={packItem.checked} onClick={toggleItem} />
          )}

          <Flex alignItems="center">
            <InlineEdit
              value={packItem.name}
              onUpdate={onChangeText}
              strike={packItem.checked}
              onEnter={() => setAddNewPackItem(true)}
            />
            <Text textDecoration={packItem.checked ? 'line-through' : 'none'} hidden={packItem.members.length !== 1}>
              &nbsp;({getMemberName(members, packItem.members[0]?.id)})
            </Text>
          </Flex>
          <Spacer />
          <Flex alignItems="center">
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
        {multipleMembers &&
          memberRows.map(({ memberItem, member }) => (
            <MemberPackItemRow
              memberItem={memberItem}
              parent={packItem}
              key={memberItem.id + member.name}
              member={member}
            />
          ))}
      </PackItemRowWrapper>
      {addNewPackItem && <NewPackItemRow categoryId={packItem.category} onHide={() => setAddNewPackItem(false)} />}
    </>
  );
}
