import { useToast } from '@chakra-ui/react';
import { ReactNode, useCallback, useState } from 'react';
import { writeDb } from '~/services/database.ts';
import { PackItem } from '~/types/PackItem.ts';
import { useDatabase } from './DatabaseContext.ts';
import { SelectModeContext } from './SelectModeContext.ts';

export function SelectModeProvider({ children }: { children: ReactNode }) {
  const [isSelectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<PackItem[]>([]);
  const { packItems } = useDatabase();
  const toast = useToast();

  const toggleItemSelection = useCallback((packItem: PackItem) => {
    setSelectedItems((currentSelectedItems) => {
      const isAlreadySelected = currentSelectedItems.some((item) => item.id === packItem.id);
      if (isAlreadySelected) {
        return currentSelectedItems.filter((item) => item.id !== packItem.id);
      }
      return [...currentSelectedItems, packItem];
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isItemSelected = useCallback(
    (packItem: PackItem) => {
      return selectedItems.some((item) => item.id === packItem.id);
    },
    [selectedItems]
  );

  // When turning off select mode, clear all selections
  const handleSetSelectMode = (value: boolean) => {
    setSelectMode(value);
    if (!value) {
      clearSelection();
    }
  };

  // Move selected items to top of their respective categories
  const moveSelectedItemsToTop = useCallback(async () => {
    if (selectedItems.length === 0) {
      return;
    }

    // Group items by their category
    const itemsByCategory: Record<string, PackItem[]> = {};
    for (const item of selectedItems) {
      const categoryId = item.category || '';
      if (!itemsByCategory[categoryId]) {
        itemsByCategory[categoryId] = [];
      }
      itemsByCategory[categoryId].push(item);
    }

    // Find max rank for each category to place items at the top
    const categoryMaxRanks: Record<string, number> = {};
    for (const item of packItems) {
      const categoryId = item.category || '';
      if (!categoryMaxRanks[categoryId] || item.rank > categoryMaxRanks[categoryId]) {
        categoryMaxRanks[categoryId] = item.rank;
      }
    }

    // Update items with new ranks
    const batch = writeDb.initBatch();
    let updatedCount = 0;

    for (const categoryId in itemsByCategory) {
      const items = itemsByCategory[categoryId];
      const baseRank = categoryMaxRanks[categoryId] || 0;

      items.forEach((item, index) => {
        const updatedItem = {
          ...item,
          rank: baseRank + index + 1,
        };
        writeDb.updatePackItemBatch(updatedItem, batch);
        updatedCount++;
      });
    }

    await batch.commit();
    toast({
      title: `Moved ${updatedCount} items to top`,
      status: 'success',
    });

    // Clear selections but stay in select mode
    clearSelection();
  }, [selectedItems, packItems, toast, clearSelection]);

  // Move selected items to bottom of their respective categories
  const moveSelectedItemsToBottom = useCallback(async () => {
    if (selectedItems.length === 0) {
      return;
    }

    // Group items by their category
    const itemsByCategory: Record<string, PackItem[]> = {};
    for (const item of selectedItems) {
      const categoryId = item.category || '';
      if (!itemsByCategory[categoryId]) {
        itemsByCategory[categoryId] = [];
      }
      itemsByCategory[categoryId].push(item);
    }

    // Find min rank for each category to place items at the bottom
    const categoryMinRanks: Record<string, number> = {};
    for (const item of packItems) {
      const categoryId = item.category || '';
      if (!categoryMinRanks[categoryId] || item.rank < categoryMinRanks[categoryId]) {
        categoryMinRanks[categoryId] = item.rank;
      }
    }

    // Update items with new ranks
    const batch = writeDb.initBatch();
    let updatedCount = 0;

    for (const categoryId in itemsByCategory) {
      const items = itemsByCategory[categoryId];
      const baseRank = categoryMinRanks[categoryId] || 0;

      items.forEach((item, index) => {
        const updatedItem = {
          ...item,
          rank: baseRank - index - 1,
        };
        writeDb.updatePackItemBatch(updatedItem, batch);
        updatedCount++;
      });
    }

    await batch.commit();
    toast({
      title: `Moved ${updatedCount} items to bottom`,
      status: 'success',
    });

    // Clear selections but stay in select mode
    clearSelection();
  }, [selectedItems, packItems, toast, clearSelection]);

  return (
    <SelectModeContext.Provider
      value={{
        isSelectMode,
        setSelectMode: handleSetSelectMode,
        selectedItems,
        toggleItemSelection,
        clearSelection,
        isItemSelected,
        moveSelectedItemsToTop,
        moveSelectedItemsToBottom,
      }}
    >
      {children}
    </SelectModeContext.Provider>
  );
}
