import { Checkbox, Flex, Spacer } from '@chakra-ui/react';
import { firebase } from '../../services/firebase.ts';
import { allChecked } from '../../services/utils.ts';
import { MemberPackItem } from '../../types/MemberPackItem.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { PLInput } from '../shared/PLInput.tsx';

export function MemberPackItemRow({
  memberItem: { checked, id },
  parent,
  member,
}: {
  memberItem: MemberPackItem;
  parent: PackItem;
  member: NamedEntity;
}) {
  async function toggleMember() {
    const find = parent.members.find((t) => t.id === id);
    if (find) {
      find.checked = !find.checked;
      parent.checked = allChecked(parent);
      await firebase.updatePackItem(parent);
    }
  }

  async function onSave(name: string) {
    member.name = name;
    await firebase.updateMembers(member);
  }

  return (
    <Flex pl="12" key={id} gap="2" align="center">
      <Checkbox isChecked={checked} onChange={toggleMember} />
      <PLInput value={member.name} onUpdate={onSave} strike={checked} />
      <Spacer />
    </Flex>
  );
}
