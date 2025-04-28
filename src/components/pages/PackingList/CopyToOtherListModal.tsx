import { Flex, useToast } from '@chakra-ui/react';
import { BaseModal } from '~/components/shared/BaseModal.tsx';
import { CategoryButton } from '~/components/shared/CategoryButton.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { writeDb } from '~/services/database.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';

interface CopyToOtherListModalProps {
  isOpen: boolean;
  onClose: () => void;
  packItemsInCat?: PackItem[];
  category?: NamedEntity;
  packItem?: PackItem;
}

export function CopyToOtherListModal({
  isOpen,
  onClose,
  packItemsInCat,
  category,
  packItem,
}: CopyToOtherListModalProps) {
  const packingLists = useDatabase().packingLists;
  const { packingList: currentPackingList } = usePackingList();
  const toast = useToast();

  // Available packing lists (excluding the current one)
  const availablePackingLists = packingLists.filter((l) => l.id !== currentPackingList.id);

  async function onClick(targetPackingList: NamedEntity) {
    // Determine which mode we're in and handle accordingly
    if (category && packItemsInCat) {
      await copyCategory(packItemsInCat, category, targetPackingList);
      toast({
        title: `Category ${category.name} copied to ${targetPackingList.name}`,
        status: 'success',
      });
    } else if (packItem) {
      await copyPackItem(packItem, targetPackingList);
      toast({
        title: `Pack item ${packItem.name} copied to ${targetPackingList.name}`,
        status: 'success',
      });
    }

    onClose();
  }

  async function copyPackItem(packItem: PackItem, targetPackingList: NamedEntity) {
    await writeDb.addPackItem(packItem.name, packItem.members, packItem.category, targetPackingList.id, packItem.rank);
  }

  async function copyCategory(packItemsInCat: PackItem[], category: NamedEntity, targetPackingList: NamedEntity) {
    const batch = writeDb.initBatch();

    for (const packItem of packItemsInCat) {
      if (packItem.category === category.id) {
        writeDb.addPackItemBatch(
          batch,
          packItem.name,
          packItem.members,
          packItem.category,
          packItem.rank,
          targetPackingList.id
        );
      }
    }

    await batch.commit();
  }

  if (availablePackingLists.length === 0) {
    return null; // Don't render if there are no other lists to copy to
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Copy to packing list">
      <Flex wrap="wrap" justify="center">
        {availablePackingLists.map((list, index) => (
          <CategoryButton key={list.id} category={list} index={index} onClick={(list) => onClick(list)} />
        ))}
      </Flex>
    </BaseModal>
  );
}
