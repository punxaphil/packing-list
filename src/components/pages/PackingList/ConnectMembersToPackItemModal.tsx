import { Button, Stack, useToast } from '@chakra-ui/react';
import { BaseModal } from '~/components/shared/BaseModal.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { writeDb } from '~/services/database.ts';
import { COLUMN_COLORS } from '~/types/Column.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import { MemberPackItem } from '~/types/MemberPackItem.ts'; // Corrected import path for MemberPackItem
import { useState, useEffect } from 'react';

function getSortedMemberIdString(memberArray: MemberPackItem[]): string {
  return memberArray
    .map((m) => m.id)
    .sort()
    .join(',');
}

export function ConnectMembersToPackItemModal({
  isOpen,
  onClose,
  packItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  packItem: PackItem;
}) {
  const members = useDatabase().members;
  const toast = useToast();
  const [localMembers, setLocalMembers] = useState<MemberPackItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalMembers([...packItem.members]);
    }
  }, [packItem.members, isOpen]);

  function toggleMemberSelection(member: NamedEntity) {
    setLocalMembers((prevLocalMembers) => {
      const memberIsInPackItem = prevLocalMembers.some((m) => m.id === member.id);
      if (memberIsInPackItem) {
        return prevLocalMembers.filter((m) => m.id !== member.id);
      }
      return [...prevLocalMembers, { id: member.id, checked: false }];
    });
  }

  async function handleDone() {
    const currentPackItemMemberIdString = getSortedMemberIdString(packItem.members);
    const selectedMemberIdString = getSortedMemberIdString(localMembers);

    if (currentPackItemMemberIdString === selectedMemberIdString) {
      onClose();
      return;
    }

    packItem.members = [...localMembers];
    await writeDb.updatePackItem(packItem);
    toast({
      title: 'Members updated successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    onClose();
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Connect members to pack item">
      <Stack direction="row" flexWrap="wrap" justifyContent="center">
        {members.map((l, index) => {
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
      <Button onClick={handleDone} w="100%" mb={2} mt={4}>
        Done
      </Button>
    </BaseModal>
  );
}
