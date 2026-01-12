import { Button, Stack, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BaseModal } from '~/components/shared/BaseModal.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useVersion } from '~/providers/VersionContext.ts';
import { writeDb } from '~/services/database.ts';
import { allChecked } from '~/services/utils.ts';
import { COLUMN_COLORS } from '~/types/Column.ts';
import { MemberPackItem } from '~/types/MemberPackItem.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';

export function ConnectMembersToPackItemModal({
  isOpen,
  onClose,
  packItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  packItem: PackItem;
}) {
  const { members: allSystemMembers, packItems: allPackItemsFromDB, setFilter } = useDatabase();
  const { scheduleVersionSave } = useVersion();
  const toast = useToast();
  const [localMembers, setLocalMembers] = useState<MemberPackItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalMembers([...packItem.members]);
    }
  }, [packItem.members, isOpen]);

  function getSortedMemberIdString(memberArray: MemberPackItem[]): string {
    return memberArray
      .map((m) => m.id)
      .sort()
      .join(',');
  }

  function getFilterDataFromLocalStorage() {
    const currentFilteredCategories = JSON.parse(localStorage.getItem('filteredCategories') || '[]') as string[];
    const currentFilteredMembers = JSON.parse(localStorage.getItem('filteredMembers') || '[]') as string[];
    const currentFilteredPackItemState = JSON.parse(localStorage.getItem('filteredPackItemState') || '[]') as string[];
    return {
      currentFilteredCategories,
      currentFilteredMembers,
      currentFilteredPackItemState,
    };
  }

  function findDisconnectedMembers(originalMembers: MemberPackItem[], newMembers: MemberPackItem[]): MemberPackItem[] {
    return originalMembers.filter((origMember) => !newMembers.some((localMember) => localMember.id === origMember.id));
  }

  function isMemberStillInOtherPackItems(memberId: string, currentPackingListId: string): boolean {
    return allPackItemsFromDB.some(
      (p) => p.packingList === currentPackingListId && p.id !== packItem.id && p.members.some((m) => m.id === memberId)
    );
  }

  function updateFiltersForDisconnectedMembers(disconnectedMembers: MemberPackItem[]) {
    const { currentFilteredCategories, currentFilteredMembers, currentFilteredPackItemState } =
      getFilterDataFromLocalStorage();
    let updatedFilteredMembers = [...currentFilteredMembers];
    let madeChangesToFilters = false;

    for (const disconnectedMember of disconnectedMembers) {
      const isStillInOtherPackItems = isMemberStillInOtherPackItems(disconnectedMember.id, packItem.packingList);

      if (!isStillInOtherPackItems && updatedFilteredMembers.includes(disconnectedMember.id)) {
        updatedFilteredMembers = updatedFilteredMembers.filter((id) => id !== disconnectedMember.id);
        madeChangesToFilters = true;
      }
    }

    if (madeChangesToFilters) {
      setFilter({
        showTheseCategories: currentFilteredCategories,
        showTheseMembers: updatedFilteredMembers,
        showTheseStates: currentFilteredPackItemState,
      });
      localStorage.setItem('filteredMembers', JSON.stringify(updatedFilteredMembers));
    }
  }

  function showSuccessToast() {
    toast({
      title: 'Members updated successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }

  function hasChanges(originalMembers: MemberPackItem[], newMembers: MemberPackItem[]): boolean {
    const currentMemberIdString = getSortedMemberIdString(originalMembers);
    const selectedMemberIdString = getSortedMemberIdString(newMembers);
    return currentMemberIdString !== selectedMemberIdString;
  }

  function toggleMemberSelection(member: NamedEntity) {
    setLocalMembers((prevLocalMembers) => {
      const memberIsInPackItem = prevLocalMembers.some((m) => m.id === member.id);
      if (memberIsInPackItem) {
        return prevLocalMembers.filter((m) => m.id !== member.id);
      }
      return [...prevLocalMembers, { id: member.id, checked: false }];
    });
  }

  function connectAllMembers() {
    const membersToAdd = allSystemMembers
      .filter((m) => !localMembers.some((lm) => lm.id === m.id))
      .map((m) => ({ id: m.id, checked: false }));
    setLocalMembers((prevLocalMembers) => [...prevLocalMembers, ...membersToAdd]);
  }

  function disconnectAllMembers() {
    setLocalMembers([]);
  }

  async function handleDone() {
    const originalMembersOfThisPackItem = [...packItem.members];

    if (!hasChanges(originalMembersOfThisPackItem, localMembers)) {
      onClose();
      return;
    }

    scheduleVersionSave('Before changing members');
    packItem.members = [...localMembers];
    packItem.checked = allChecked(packItem);
    await writeDb.updatePackItem(packItem);
    showSuccessToast();

    const membersDisconnectedFromThisSpecificItem = findDisconnectedMembers(
      originalMembersOfThisPackItem,
      localMembers
    );
    if (membersDisconnectedFromThisSpecificItem.length > 0) {
      updateFiltersForDisconnectedMembers(membersDisconnectedFromThisSpecificItem);
    }

    onClose();
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Connect members to pack item">
      <Stack direction="row" flexWrap="wrap" justifyContent="center">
        {allSystemMembers.map((l, index) => {
          const memberIsInPackItem = localMembers.some((m) => m.id === l.id);
          const color = COLUMN_COLORS[index % COLUMN_COLORS.length];
          return (
            <Button
              key={l.id}
              onClick={() => toggleMemberSelection(l)}
              m="3"
              bg={memberIsInPackItem ? color : ''}
              borderColor={memberIsInPackItem ? 'black' : color}
              borderWidth={memberIsInPackItem ? 2 : 4}
            >
              {l.name}
            </Button>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={4} mt={4} justifyContent="center">
        <Button onClick={connectAllMembers} variant="outline">
          Connect All
        </Button>
        <Button onClick={disconnectAllMembers} variant="outline">
          Disconnect All
        </Button>
      </Stack>

      <Button onClick={handleDone} w="100%" mb={2} mt={4}>
        Done
      </Button>
    </BaseModal>
  );
}
