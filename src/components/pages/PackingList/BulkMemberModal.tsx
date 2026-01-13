import { Button, Flex, Text, useToast, VStack } from '@chakra-ui/react';
import { useMemo } from 'react';
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
  const { selectedItems, clearSelection } = useSelectMode();
  const toast = useToast();

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

  async function handleMemberClick(memberId: string) {
    if (selectedItems.length === 0) {
      return;
    }

    const stats = memberStats[memberId];
    const shouldAdd = !stats?.all;

    const batch = writeDb.initBatch();
    let updatedCount = 0;

    for (const item of selectedItems) {
      const hasMember = item.members.some((m) => m.id === memberId);

      if (shouldAdd && !hasMember) {
        const updatedMembers = [...item.members, { id: memberId, checked: false }];
        writeDb.updatePackItemBatch({ ...item, members: updatedMembers }, batch);
        updatedCount++;
      } else if (!shouldAdd && hasMember) {
        const updatedMembers = item.members.filter((m) => m.id !== memberId);
        writeDb.updatePackItemBatch({ ...item, members: updatedMembers }, batch);
        updatedCount++;
      }
    }

    await batch.commit();

    const memberName = members.find((m) => m.id === memberId)?.name || 'member';
    const actionWord = shouldAdd ? 'Added' : 'Removed';
    const preposition = shouldAdd ? 'to' : 'from';

    toast({
      title: `${actionWord} ${memberName} ${preposition} ${updatedCount} items`,
      status: 'success',
    });

    clearSelection();
    onClose();
  }

  function getMemberLabel(memberId: string, memberName: string) {
    const stats = memberStats[memberId];
    if (!stats || stats.none) {
      return memberName;
    }
    if (stats.all) {
      return `${memberName} ✓`;
    }
    return `${memberName} (${stats.count}/${selectedItems.length})`;
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Manage members">
      <VStack align="stretch" spacing={3}>
        <Text fontSize="sm">{selectedItems.length} items selected. Click to add/remove member.</Text>
        <Flex wrap="wrap" justify="center" gap={2}>
          {members.map((member, index) => {
            const color = COLUMN_COLORS[index % COLUMN_COLORS.length];
            const stats = memberStats[member.id];
            const hasAll = stats?.all;
            const hasNone = stats?.none;
            const hasSome = !hasAll && !hasNone;
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
      </VStack>
    </BaseModal>
  );
}
