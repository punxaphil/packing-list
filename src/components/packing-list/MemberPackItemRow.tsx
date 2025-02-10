import { Editable, EditableInput, EditablePreview } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/react';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { firebase } from '../../services/api.ts';
import { allChecked } from '../../services/utils.ts';
import { MemberPackItem } from '../../types/MemberPackItem.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';

export function MemberPackItemRow({
  memberItem: { checked, id },
  parent,
  member,
}: {
  memberItem: MemberPackItem;
  parent: PackItem;
  member: NamedEntity;
}) {
  const [name, setName] = useState(member.name);

  async function toggleMember() {
    const find = parent.members?.find((t) => t.id === id);
    if (find) {
      find.checked = !find.checked;
      parent.checked = allChecked(parent);
      await firebase.updatePackItem(parent);
    }
  }

  async function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  async function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onSave();
    }
  }

  async function onSave() {
    member.name = name;
    await firebase.updateMembers(member);
  }

  return (
    <Flex pl="5" key={id} gap="2" align="center">
      <PLCheckbox checked={checked} onClick={toggleMember} />
      <Editable>
        <EditablePreview textDecoration={checked ? 'line-through' : 'none'} />
        <EditableInput value={name} onChange={onNameChange} onKeyDown={handleEnter} onBlur={onSave} />
      </Editable>
    </Flex>
  );
}
