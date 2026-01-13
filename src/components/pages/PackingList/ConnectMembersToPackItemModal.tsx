import { Button, Stack, useToast } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { BaseModal } from '~/components/shared/BaseModal.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useSelectMode } from '~/providers/SelectModeContext.ts';
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
  packItem?: PackItem;
}) {
  const { members: allSystemMembers, packItems: allPackItemsFromDB, setFilter } = useDatabase();
  const { selectedItems, clearSelection } = useSelectMode();
  const { scheduleVersionSave } = useVersion();
  const toast = useToast();
  const [localMembers, setLocalMembers] = useState<MemberPackItem[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  const isBulkMode = !packItem;
  const itemsToUpdate = useMemo(
    () => (isBulkMode ? selectedItems : packItem ? [packItem] : []),
    [isBulkMode, selectedItems, packItem]
  );

  const memberStats = useMemo(() => {
    if (!isBulkMode) {
      return {};
    }
    const stats: Record<string, { all: boolean; none: boolean; count: number }> = {};
    for (const member of allSystemMembers) {
      const itemsWithMember = itemsToUpdate.filter((item) => item.members.some((m) => m.id === member.id));
      stats[member.id] = {
        all: itemsWithMember.length === itemsToUpdate.length && itemsToUpdate.length > 0,
        none: itemsWithMember.length === 0,
        count: itemsWithMember.length,
      };
    }
    return stats;
  }, [isBulkMode, allSystemMembers, itemsToUpdate]);

  useEffect(() => {
    if (isOpen) {
      if (isBulkMode) {
        setPendingChanges({});
      } else if (packItem) {
        setLocalMembers([...packItem.members]);
      }
    }
  }, [isOpen, isBulkMode, packItem]);

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

  function isMemberStillInOtherPackItems(
    memberId: string,
    currentPackingListId: string,
    excludeItemIds: string[]
  ): boolean {
    return allPackItemsFromDB.some(
      (p) =>
        p.packingList === currentPackingListId &&
        !excludeItemIds.includes(p.id) &&
        p.members.some((m) => m.id === memberId)
    );
  }

  function updateFiltersForDisconnectedMembers(disconnectedMembers: MemberPackItem[], itemIds: string[]) {
    if (itemsToUpdate.length === 0) {
      return;
    }
    const packingListId = itemsToUpdate[0].packingList;
    const { currentFilteredCategories, currentFilteredMembers, currentFilteredPackItemState } =
      getFilterDataFromLocalStorage();
    let updatedFilteredMembers = [...currentFilteredMembers];
    let madeChangesToFilters = false;

    for (const disconnectedMember of disconnectedMembers) {
      const isStillInOtherPackItems = isMemberStillInOtherPackItems(disconnectedMember.id, packingListId, itemIds);

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
    if (isBulkMode) {
      const currentState = getEffectiveState(member.id);
      const newState = currentState !== 'all';
      setPendingChanges((prev) => ({ ...prev, [member.id]: newState }));
    } else {
      setLocalMembers((prevLocalMembers) => {
        const memberIsInPackItem = prevLocalMembers.some((m) => m.id === member.id);
        if (memberIsInPackItem) {
          return prevLocalMembers.filter((m) => m.id !== member.id);
        }
        return [...prevLocalMembers, { id: member.id, checked: false }];
      });
    }
  }

  function getEffectiveState(memberId: string): 'all' | 'none' | 'some' {
    if (memberId in pendingChanges) {
      return pendingChanges[memberId] ? 'all' : 'none';
    }
    const stats = memberStats[memberId];
    if (stats?.all) {
      return 'all';
    }
    if (stats?.none) {
      return 'none';
    }
    return 'some';
  }

  function connectAllMembers() {
    if (isBulkMode) {
      const changes: Record<string, boolean> = {};
      for (const member of allSystemMembers) {
        changes[member.id] = true;
      }
      setPendingChanges(changes);
    } else {
      const membersToAdd = allSystemMembers
        .filter((m) => !localMembers.some((lm) => lm.id === m.id))
        .map((m) => ({ id: m.id, checked: false }));
      setLocalMembers((prevLocalMembers) => [...prevLocalMembers, ...membersToAdd]);
    }
  }

  function disconnectAllMembers() {
    if (isBulkMode) {
      const changes: Record<string, boolean> = {};
      for (const member of allSystemMembers) {
        changes[member.id] = false;
      }
      setPendingChanges(changes);
    } else {
      setLocalMembers([]);
    }
  }

  async function handleBulkDone() {
    if (itemsToUpdate.length === 0 || Object.keys(pendingChanges).length === 0) {
      onClose();
      return;
    }

    scheduleVersionSave('Before changing members');
    const batch = writeDb.initBatch();
    let updatedCount = 0;
    const allDisconnectedMembers: MemberPackItem[] = [];

    for (const item of itemsToUpdate) {
      let membersChanged = false;
      let updatedMembers = [...item.members];

      for (const [memberId, shouldHave] of Object.entries(pendingChanges)) {
        const hasMember = updatedMembers.some((m) => m.id === memberId);

        if (shouldHave && !hasMember) {
          updatedMembers.push({ id: memberId, checked: false });
          membersChanged = true;
        } else if (!shouldHave && hasMember) {
          allDisconnectedMembers.push({ id: memberId, checked: false });
          updatedMembers = updatedMembers.filter((m) => m.id !== memberId);
          membersChanged = true;
        }
      }

      if (membersChanged) {
        const updatedItem = { ...item, members: updatedMembers };
        updatedItem.checked = allChecked(updatedItem);
        writeDb.updatePackItemBatch(updatedItem, batch);
        updatedCount++;
      }
    }

    await batch.commit();

    toast({
      title: `Updated members on ${updatedCount} items`,
      status: 'success',
    });

    if (allDisconnectedMembers.length > 0) {
      updateFiltersForDisconnectedMembers(
        allDisconnectedMembers,
        itemsToUpdate.map((i) => i.id)
      );
    }

    clearSelection();
    onClose();
  }

  async function handleSingleDone() {
    if (!packItem) {
      onClose();
      return;
    }

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
      updateFiltersForDisconnectedMembers(membersDisconnectedFromThisSpecificItem, [packItem.id]);
    }

    onClose();
  }

  async function handleDone() {
    if (isBulkMode) {
      await handleBulkDone();
    } else {
      await handleSingleDone();
    }
  }

  function getMemberLabel(memberId: string, memberName: string): string {
    if (!isBulkMode) {
      return memberName;
    }
    const effectiveState = getEffectiveState(memberId);
    if (effectiveState === 'none') {
      return memberName;
    }
    if (effectiveState === 'all') {
      return `${memberName} ✓`;
    }
    const stats = memberStats[memberId];
    return `${memberName} (${stats?.count || 0}/${itemsToUpdate.length})`;
  }

  function getMemberButtonStyle(member: NamedEntity, index: number) {
    const color = COLUMN_COLORS[index % COLUMN_COLORS.length];
    if (isBulkMode) {
      const effectiveState = getEffectiveState(member.id);
      const hasAll = effectiveState === 'all';
      const hasNone = effectiveState === 'none';
      const hasSome = effectiveState === 'some';
      return {
        bg: hasNone ? 'transparent' : color,
        borderColor: hasAll ? 'gray.800' : hasSome ? color : 'gray.300',
        borderWidth: hasAll ? 3 : 2,
        borderStyle: hasSome ? 'dashed' : 'solid',
      };
    }
    const memberIsInPackItem = localMembers.some((m) => m.id === member.id);
    return {
      bg: memberIsInPackItem ? color : '',
      borderColor: memberIsInPackItem ? 'black' : color,
      borderWidth: memberIsInPackItem ? 2 : 4,
      borderStyle: 'solid',
    };
  }

  const title = isBulkMode ? 'Manage members' : 'Connect members to pack item';

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      <Stack direction="row" flexWrap="wrap" justifyContent="center">
        {allSystemMembers.map((member, index) => {
          const style = getMemberButtonStyle(member, index);
          return (
            <Button
              key={member.id}
              onClick={() => toggleMemberSelection(member)}
              m="3"
              bg={style.bg}
              borderColor={style.borderColor}
              borderWidth={style.borderWidth}
              borderStyle={style.borderStyle as 'solid' | 'dashed'}
            >
              {getMemberLabel(member.id, member.name)}
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
