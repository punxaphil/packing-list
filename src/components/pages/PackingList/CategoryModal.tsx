import { Button, Divider, Flex, Text, VStack, useToast } from '@chakra-ui/react';
import { BaseModal } from '~/components/shared/BaseModal.tsx';
import { CategoryButton } from '~/components/shared/CategoryButton.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useSelectMode } from '~/providers/SelectModeContext.ts';
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
  const { selectedItems, clearSelection, setSelectMode } = useSelectMode();
  const toast = useToast();

  // Determine if we're in single or multi mode
  const isSingleItemMode = !!packItem;
  const itemsToMove = isSingleItemMode && packItem ? [packItem] : selectedItems;

  // Check if all selected items are already uncategorized
  const allItemsUncategorized =
    !isSingleItemMode && selectedItems.length > 0 && selectedItems.every((item) => !item.category);

  // Check if we should show the remove category option
  const showRemoveCategoryOption = isSingleItemMode
    ? packItem && !!packItem.category // In single mode, only if the item has a category
    : !allItemsUncategorized; // In multi mode, only if not all items are uncategorized

  // Find the lowest rank in a category (for placing items at the bottom)
  function getBottomRank(categoryId: string): number {
    const itemsInCategory = packItems.filter((item) => item.category === categoryId);
    return itemsInCategory.length === 0 ? 0 : Math.min(...itemsInCategory.map((item) => item.rank)) - 1;
  }

  // Handle single item category change
  async function handleSingleItemCategoryChange(category: NamedEntity | null) {
    if (!packItem) {
      return;
    }

    const updatedPackItem: PackItem = {
      ...packItem,
      category: category?.id || '',
    };

    await writeDb.updatePackItem(updatedPackItem);

    const message = category ? `Moved ${packItem.name} to ${category.name}` : `Removed category from ${packItem.name}`;

    toast({ title: message, status: 'success' });
    onClose();
  }

  // Handle multiple items category change
  async function handleMultipleItemsCategoryChange(category: NamedEntity | null) {
    const batch = writeDb.initBatch();

    if (category === null) {
      // Remove category from all selected items
      for (const item of selectedItems) {
        const updatedItem = { ...item, category: '' };
        writeDb.updatePackItemBatch(updatedItem, batch);
      }

      await batch.commit();
      toast({
        title: `Removed category from ${selectedItems.length} items`,
        status: 'success',
      });
    } else {
      // Add items to category, positioning them at the bottom
      let currentRank = getBottomRank(category.id);

      for (const item of selectedItems) {
        const updatedItem = {
          ...item,
          category: category.id,
          rank: currentRank,
        };
        writeDb.updatePackItemBatch(updatedItem, batch);
        currentRank--; // Decrement rank to place next item below this one
      }

      await batch.commit();
      toast({
        title: `Moved ${selectedItems.length} items to ${category.name}`,
        status: 'success',
      });
    }

    // Clear selections and exit select mode after multi-operation
    clearSelection();
    setSelectMode(false);
    onClose();
  }

  async function onClick(category: NamedEntity | null) {
    if (itemsToMove.length === 0) {
      onClose();
      return;
    }

    isSingleItemMode
      ? await handleSingleItemCategoryChange(category)
      : await handleMultipleItemsCategoryChange(category);
  }

  // In single mode, exclude the current category from options
  const availableCategories =
    isSingleItemMode && packItem ? categories.filter((c) => c.id !== packItem.category) : categories;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Category">
      <VStack align="stretch" spacing={3}>
        {showRemoveCategoryOption && (
          <>
            <Button onClick={() => onClick(null)} colorScheme="gray" variant="outline" width="100%">
              Remove category
            </Button>

            <Divider my={2} />
          </>
        )}

        <Text fontSize="sm" fontWeight="medium">
          Available Categories:
        </Text>

        {/* Category buttons */}
        <Flex wrap="wrap" justify="center">
          {availableCategories.map((category, index) => (
            <CategoryButton key={category.id} category={category} index={index} onClick={(c) => onClick(c)} />
          ))}
        </Flex>
      </VStack>
    </BaseModal>
  );
}
