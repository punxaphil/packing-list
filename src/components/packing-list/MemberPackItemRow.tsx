import { Flex } from '@chakra-ui/react';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { allChecked, getName } from '../../services/utils.ts';
import { MemberPackItem } from '../../types/MemberPackItem.ts';
import { PackItem } from '../../types/PackItem.ts';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';
import { Span } from '../shared/Span.tsx';

export function MemberPackItemRow({
  memberItem: { checked, id },
  parent,
}: {
  memberItem: MemberPackItem;
  parent: PackItem;
}) {
  const members = useFirebase().members;

  async function toggleMember() {
    const find = parent.members?.find((t) => t.id === id);
    if (find) {
      find.checked = !find.checked;
      parent.checked = allChecked(parent);
      await firebase.updatePackItem(parent);
    }
  }

  return (
    <Flex pl="5" key={id} gap="2" align="center">
      <PLCheckbox checked={checked} onClick={toggleMember} />
      <Span strike={checked}>{getName(members, id)}</Span>
    </Flex>
  );
}
