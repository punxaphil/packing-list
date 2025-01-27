import { MemberItem } from '../../types/MemberItem.ts';
import { allChecked, getName } from '../../services/utils.ts';
import { Item } from '../../types/Item.ts';
import { PLCheckbox } from '../shared/PLCheckbox.tsx';
import { Span } from '../shared/Span.tsx';
import { Flex } from '@radix-ui/themes';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';

export function MemberItemRow({ memberItem: { checked, id }, parent }: { memberItem: MemberItem; parent: Item }) {
  const members = useFirebase().members;

  async function toggleMember() {
    const find = parent.members?.find((t) => t.id === id);
    if (find) {
      find.checked = !find.checked;
      parent.checked = allChecked(parent);
      await firebase.updateItem(parent);
    }
  }

  return (
    <Flex pl="5" key={id} gap="2" align="center">
      <PLCheckbox checked={checked} onClick={toggleMember} />
      <Span strike={checked}>{getName(members, id)}</Span>
    </Flex>
  );
}
