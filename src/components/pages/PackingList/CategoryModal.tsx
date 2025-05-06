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
  const { selectedItems, clearSelection } = useSelectMode();
  const toast = useToast();

  // Determine if we're in single or multi mode
  const isSingleItemMode = !!packItem;
  const itemsToMove = isSingleItemMode && packItem ? [packItem] : selectedItems;

  // Check if all selected items are already uncategorized
  const allItemsUncategorized =
    !isSingleItemMode && itemsToMove.length > 0 && itemsToMove.every((item) => !item.category);

  // Check if we should show the remove category option
  const showRemoveCategoryOption = isSingleItemMode
    ? packItem && !!packItem.category // In single mode, only if the item has a category
    : !allItemsUncategorized; // In multi mode, only if not all items are uncategorized

  // Find the lowest rank in a category (for placing items at the bottom)
  function getBottomRank(categoryId: string): number {
    const itemsInCategory = packItems.filter((item) => item.category === categoryId);
    // If category is empty, rank is 0, otherwise place below the last item
    return itemsInCategory.length === 0 ? 0 : Math.min(...itemsInCategory.map((item) => item.rank)) - 1;
  }

  // Handle category change for one or more items
  async function handleCategoryChange(category: NamedEntity | null) {
    if (itemsToMove.length === 0) {
      onClose();
      return;
    }

    const batch = writeDb.initBatch();
    const newCategoryId = category?.id || '';
    let message: string;

    if (isSingleItemMode && packItem) {
      const updatedPackItem: PackItem = {
        ...packItem,
        category: newCategoryId,
      };
      // For single item, rank is not changed unless moved to a new category where it's placed at bottom
      if (packItem.category !== newCategoryId && newCategoryId !== '') {
        updatedPackItem.rank = getBottomRank(newCategoryId);
      } else if (newCategoryId === '') {
        // If category is removed, rank might need adjustment if it was based on category context
        // For now, we keep it, but this could be a point of future refinement.
      }
      writeDb.updatePackItemBatch(updatedPackItem, batch); // Use batch even for single item for consistency
      message = category ? `Moved ${packItem.name} to ${category.name}` : `Removed category from ${packItem.name}`;
    } else {
      // Multi-item mode
      if (newCategoryId === '') {
        // Remove category from all selected items
        for (const item of itemsToMove) {
          const updatedItem = { ...item, category: '' };
          writeDb.updatePackItemBatch(updatedItem, batch);
        }
        message = `Removed category from ${itemsToMove.length} items`;
      } else {
        // Add items to a new category, positioning them at the bottom
        let currentRank = getBottomRank(newCategoryId);
        for (const item of itemsToMove) {
          const updatedItem = {
            ...item,
            category: newCategoryId,
            rank: currentRank,
          };
          writeDb.updatePackItemBatch(updatedItem, batch);
          currentRank--; // Decrement rank to place next item below this one
        }
        if (category) {
          // Check if category is not null before accessing its name
          message = `Moved ${itemsToMove.length} items to ${category.name}`;
        } else {
          // This case should ideally not be reached if newCategoryId is not ''
          // but as a fallback or if logic changes, this handles it.
          message = `Moved ${itemsToMove.length} items to a new category`;
        }
      }
      clearSelection(); // Clear selections only in multi-item mode
    }

    await batch.commit();
    toast({ title: message, status: 'success' });
    onClose();
  }

  // In single mode, exclude the current category from options
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

        {/* Category buttons */}
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
