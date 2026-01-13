import { Checkbox } from '@chakra-ui/react';
import { allChecked } from '~/services/utils.ts';
import { PackItem } from '~/types/PackItem.ts';

export function MultiCheckbox({
  packItem,
  onUpdate,
  disabled,
  filteredMemberIds,
}: {
  packItem: PackItem;
  onUpdate: (item: PackItem) => void;
  disabled?: boolean;
  filteredMemberIds?: string[];
}) {
  const hasFilter = filteredMemberIds && filteredMemberIds.length > 0;
  const membersToToggle = hasFilter
    ? packItem.members.filter((m) => filteredMemberIds.includes(m.id))
    : packItem.members;

  const allFilteredChecked = membersToToggle.every((m) => m.checked);
  const allFilteredUnchecked = membersToToggle.every((m) => !m.checked);

  function toggleFilteredMembers() {
    const newCheckedState = !allFilteredChecked;
    for (const member of membersToToggle) {
      member.checked = newCheckedState;
    }
    packItem.checked = allChecked(packItem);
    onUpdate(packItem);
  }

  return (
    <Checkbox
      isIndeterminate={!allFilteredChecked && !allFilteredUnchecked}
      isChecked={allFilteredChecked}
      onChange={toggleFilteredMembers}
      isDisabled={disabled}
    />
  );
}
