import { Flex, IconButton, Spacer } from '@chakra-ui/react';
import { AiOutlineUserDelete } from 'react-icons/ai';
import { firebase } from '../../services/firebase.ts';
import { allChecked } from '../../services/utils.ts';
import { MemberPackItem } from '../../types/MemberPackItem.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';
import { PLInput } from '../shared/PLInput.tsx';

export function MemberPackItemRow({
  memberItem: { checked, id },
  parent,
  member,
  showControls,
  onFocus,
}: {
  memberItem: MemberPackItem;
  parent: PackItem;
  member: NamedEntity;
  showControls?: boolean;
  onFocus?: () => void;
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

  async function onDelete() {
    parent.members = parent.members.filter((t) => t.id !== id);
    await firebase.updatePackItem(parent);
  }

  return (
    <Flex pl="12" key={id} gap="2" align="center">
      <PLCheckbox checked={checked} onClick={toggleMember} />
      <PLInput value={member.name} onUpdate={onSave} strike={checked} grow={true} onFocus={onFocus} />
      <Spacer />
      {showControls && (
        <IconButton
          aria-label={`Remove ${member.name} from pack item`}
          icon={<AiOutlineUserDelete />}
          onClick={onDelete}
          variant="ghost"
          size="sm"
        />
      )}
    </Flex>
  );
}
