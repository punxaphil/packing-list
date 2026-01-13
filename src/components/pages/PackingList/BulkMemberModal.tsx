import { Button, Flex, Text, useToast, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { BaseModal } from '~/components/shared/BaseModal.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useSelectMode } from '~/providers/SelectModeContext.ts';
import { writeDb } from '~/services/database.ts';
import { COLUMN_COLORS } from '~/types/Column.ts';

interface BulkMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkMemberModal({ isOpen, onClose }: BulkMemberModalProps) {
  const { members } = useDatabase();
  const { selectedItems } = useSelectMode();
  const toast = useToast();
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setPendingChanges({});
    }
  }, [isOpen]);

  const memberStats = useMemo(() => {
    const stats: Record<string, { all: boolean; none: boolean; count: number }> = {};
    for (const member of members) {
      const itemsWithMember = selectedItems.filter((item) => item.members.some((m) => m.id === member.id));
      stats[member.id] = {
        all: itemsWithMember.length === selectedItems.length && selectedItems.length > 0,
        none: itemsWithMember.length === 0,
        count: itemsWithMember.length,
      };
    }
    return stats;
  }, [members, selectedItems]);

  function getEffectiveState(memberId: string) {
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

  function handleMemberClick(memberId: string) {
    const currentState = getEffectiveState(memberId);
    const newState = currentState !== 'all';
    setPendingChanges((prev) => ({ ...prev, [memberId]: newState }));
  }

  async function handleDone() {
    if (selectedItems.length === 0 || Object.keys(pendingChanges).length === 0) {
      onClose();
      return;
    }

    const batch = writeDb.initBatch();
    let updatedCount = 0;

    for (const item of selectedItems) {
      let membersChanged = false;
      let updatedMembers = [...item.members];

      for (const [memberId, shouldHave] of Object.entries(pendingChanges)) {
        const hasMember = updatedMembers.some((m) => m.id === memberId);

        if (shouldHave && !hasMember) {
          updatedMembers.push({ id: memberId, checked: false });
          membersChanged = true;
        } else if (!shouldHave && hasMember) {
          updatedMembers = updatedMembers.filter((m) => m.id !== memberId);
          membersChanged = true;
        }
      }

      if (membersChanged) {
        writeDb.updatePackItemBatch({ ...item, members: updatedMembers }, batch);
        updatedCount++;
      }
    }

    await batch.commit();

    toast({
      title: `Updated members on ${updatedCount} items`,
      status: 'success',
    });

    onClose();
  }

  function getMemberLabel(memberId: string, memberName: string) {
    const effectiveState = getEffectiveState(memberId);
    if (effectiveState === 'none') {
      return memberName;
    }
    if (effectiveState === 'all') {
      return `${memberName} ✓`;
    }
    const stats = memberStats[memberId];
    return `${memberName} (${stats?.count || 0}/${selectedItems.length})`;
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Manage members">
      <VStack align="stretch" spacing={3}>
        <Text fontSize="sm">{selectedItems.length} items selected. Click to add/remove member.</Text>
        <Flex wrap="wrap" justify="center" gap={2}>
          {members.map((member, index) => {
            const color = COLUMN_COLORS[index % COLUMN_COLORS.length];
            const effectiveState = getEffectiveState(member.id);
            const hasAll = effectiveState === 'all';
            const hasNone = effectiveState === 'none';
            const hasSome = effectiveState === 'some';
            return (
              <Button
                key={member.id}
                onClick={() => handleMemberClick(member.id)}
                bg={hasNone ? 'transparent' : color}
                borderColor={hasAll ? 'gray.800' : hasSome ? color : 'gray.300'}
                borderWidth={hasAll ? 3 : 2}
                borderStyle={hasSome ? 'dashed' : 'solid'}
              >
                {getMemberLabel(member.id, member.name)}
              </Button>
            );
          })}
        </Flex>
        <Button colorScheme="blue" onClick={handleDone} alignSelf="flex-end">
          Done
        </Button>
      </VStack>
    </BaseModal>
  );
}
