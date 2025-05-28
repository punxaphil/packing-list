import { Button, Divider, Flex, Text, VStack, useToast } from '@chakra-ui/react';
import { BaseModal } from '~/components/shared/BaseModal.tsx';
import { CategoryButton } from '~/components/shared/CategoryButton.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useSelectMode } from '~/providers/SelectModeContext.ts';
import { useUndo } from '~/providers/UndoContext.ts';
import { writeDb } from '~/services/database.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  packItem?: PackItem; // Optional - if provided, we're moving a single item
}

export function CategoryModal({ isOpen, onClose, packItem }: CategoryModalProps) {
  const { categories, packItems } = useDatabase();
  const { selectedItems, clearSelection } = useSelectMode();
  const { addUndoAction } = useUndo();
  const toast = useToast();

  const isSingleItemMode = !!packItem;
  const itemsToMove = isSingleItemMode && packItem ? [packItem] : selectedItems;

  const allItemsUncategorized =
    !isSingleItemMode && itemsToMove.length > 0 && itemsToMove.every((item) => !item.category);

  const showRemoveCategoryOption = isSingleItemMode ? packItem && !!packItem.category : !allItemsUncategorized;

  function getBottomRank(categoryId: string): number {
    const itemsInCategory = packItems.filter((item) => item.category === categoryId);
    return itemsInCategory.length === 0 ? 0 : Math.min(...itemsInCategory.map((item) => item.rank)) - 1;
  }

  async function handleCategoryChange(category: NamedEntity | null) {
    if (itemsToMove.length === 0) {
      onClose();
      return;
    }

    const captureOriginalOrder = () =>
      itemsToMove.map((item) => ({
        id: item.id,
        rank: item.rank,
        category: item.category,
      }));

    const handleSingleItemChange = (newCategoryId: string) => {
      if (!packItem) {
        return { batch: writeDb.initBatch(), message: '' };
      }

      const batch = writeDb.initBatch();
      const updatedPackItem: PackItem = {
        ...packItem,
        category: newCategoryId,
      };

      if (packItem.category !== newCategoryId && newCategoryId !== '') {
        updatedPackItem.rank = getBottomRank(newCategoryId);
      }

      writeDb.updatePackItemBatch(updatedPackItem, batch);
      const message = category
        ? `Moved ${packItem.name} to ${category.name}`
        : `Removed category from ${packItem.name}`;

      return { batch, message };
    };

    const handleMultiItemChange = (newCategoryId: string) => {
      const batch = writeDb.initBatch();
      let message: string;

      if (newCategoryId === '') {
        for (const item of itemsToMove) {
          const updatedItem = { ...item, category: '' };
          writeDb.updatePackItemBatch(updatedItem, batch);
        }
        message = `Removed category from ${itemsToMove.length} items`;
      } else {
        let currentRank = getBottomRank(newCategoryId);
        for (const item of itemsToMove) {
          const updatedItem = {
            ...item,
            category: newCategoryId,
            rank: currentRank,
          };
          writeDb.updatePackItemBatch(updatedItem, batch);
          currentRank--;
        }
        message = category
          ? `Moved ${itemsToMove.length} items to ${category.name}`
          : `Moved ${itemsToMove.length} items to a new category`;
      }

      clearSelection();
      return { batch, message };
    };

    const originalOrder = captureOriginalOrder();
    const newCategoryId = category?.id || '';

    const { batch, message } =
      isSingleItemMode && packItem ? handleSingleItemChange(newCategoryId) : handleMultiItemChange(newCategoryId);

    await batch.commit();

    addUndoAction({
      type: 'move-items',
      description: message,
      data: {
        items: itemsToMove,
        originalOrder,
      },
    });

    toast({ title: message, status: 'success' });
    onClose();
  }

  const availableCategories =
    isSingleItemMode && packItem ? categories.filter((c) => c.id !== packItem.category) : categories;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Category">
      <VStack align="stretch" spacing={3}>
        {showRemoveCategoryOption && (
          <>
            <Button onClick={() => handleCategoryChange(null)} colorScheme="gray" variant="outline" width="100%">
              Remove category
            </Button>

            <Divider my={2} />
          </>
        )}

        <Text fontSize="sm" fontWeight="medium">
          Available Categories:
        </Text>

        <Flex wrap="wrap" justify="center">
          {availableCategories.map((category, index) => (
            <CategoryButton
              key={category.id}
              category={category}
              index={index}
              onClick={(c) => handleCategoryChange(c)}
            />
          ))}
        </Flex>
      </VStack>
    </BaseModal>
  );
}
