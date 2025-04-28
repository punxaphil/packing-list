import { Button, Stack, useToast } from '@chakra-ui/react';
import { BaseModal } from '~/components/shared/BaseModal.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { writeDb } from '~/services/database.ts';
import { COLUMN_COLORS } from '~/types/Column.ts';
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
  const members = useDatabase().members;
  const toast = useToast();

  async function onClick(member: NamedEntity) {
    const memberIsInPackItem = packItem.members.some((m) => m.id === member.id);
    let title: string;
    if (memberIsInPackItem) {
      packItem.members = packItem.members.filter((m) => m.id !== member.id);
      title = `Removed ${member.name} from ${packItem.name}`;
    } else {
      packItem.members.push({ id: member.id, checked: false });
      title = `Added ${member.name} to ${packItem.name}`;
    }
    await writeDb.updatePackItem(packItem);
    toast({
      title: title,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Connect members to pack item">
      <Stack direction="row" flexWrap="wrap" justifyContent="center">
        {members.map((l, index) => {
          const memberIsInPackItem = packItem.members.some((m) => m.id === l.id);
          const color = COLUMN_COLORS[index % COLUMN_COLORS.length];
          return (
            <Button
              key={l.id}
              onClick={() => onClick(l)}
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
      <Button onClick={onClose} w="100%" mb={2} mt={4}>
        Done
      </Button>
    </BaseModal>
  );
}
