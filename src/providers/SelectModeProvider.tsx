import { useToast } from '@chakra-ui/react';
import { ReactNode, useCallback, useState } from 'react';
import { writeDb } from '~/services/database.ts';
import { PackItem } from '~/types/PackItem.ts';
import { useDatabase } from './DatabaseContext.ts';
import { SelectModeContext } from './SelectModeContext.ts';
import { useUndo } from './UndoContext.ts';

export function SelectModeProvider({ children }: { children: ReactNode }) {
  const [isSelectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<PackItem[]>([]);
  const { packItems } = useDatabase();
  const { addUndoAction } = useUndo();
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

  const handleSetSelectMode = (value: boolean) => {
    setSelectMode(value);
    if (!value) {
      clearSelection();
    }
  };

  const moveSelectedItemsToTop = useCallback(async () => {
    if (selectedItems.length === 0) {
      return;
    }

    const captureOriginalOrder = () =>
      selectedItems.map((item) => ({
        id: item.id,
        rank: item.rank,
        category: item.category,
      }));

    const groupItemsByCategory = () => {
      const itemsByCategory: Record<string, PackItem[]> = {};
      for (const item of selectedItems) {
        const categoryId = item.category || '';
        if (!itemsByCategory[categoryId]) {
          itemsByCategory[categoryId] = [];
        }
        itemsByCategory[categoryId].push(item);
      }
      return itemsByCategory;
    };

    const findCategoryMaxRanks = () => {
      const categoryMaxRanks: Record<string, number> = {};
      for (const item of packItems) {
        const categoryId = item.category || '';
        if (!categoryMaxRanks[categoryId] || item.rank > categoryMaxRanks[categoryId]) {
          categoryMaxRanks[categoryId] = item.rank;
        }
      }
      return categoryMaxRanks;
    };

    const updateItemRanksToTop = (
      itemsByCategory: Record<string, PackItem[]>,
      categoryMaxRanks: Record<string, number>
    ) => {
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

      return { batch, updatedCount };
    };

    const originalOrder = captureOriginalOrder();
    const itemsByCategory = groupItemsByCategory();
    const categoryMaxRanks = findCategoryMaxRanks();
    const { batch, updatedCount } = updateItemRanksToTop(itemsByCategory, categoryMaxRanks);

    await batch.commit();

    addUndoAction({
      type: 'move-items',
      description: `Moved ${updatedCount} items to top`,
      data: {
        items: selectedItems,
        originalOrder,
      },
    });

    toast({
      title: `Moved ${updatedCount} items to top`,
      status: 'success',
    });

    clearSelection();
  }, [selectedItems, packItems, addUndoAction, toast, clearSelection]);

  const moveSelectedItemsToBottom = useCallback(async () => {
    if (selectedItems.length === 0) {
      return;
    }

    const captureOriginalOrder = () =>
      selectedItems.map((item) => ({
        id: item.id,
        rank: item.rank,
        category: item.category,
      }));

    const groupItemsByCategory = () => {
      const itemsByCategory: Record<string, PackItem[]> = {};
      for (const item of selectedItems) {
        const categoryId = item.category || '';
        if (!itemsByCategory[categoryId]) {
          itemsByCategory[categoryId] = [];
        }
        itemsByCategory[categoryId].push(item);
      }
      return itemsByCategory;
    };

    const findCategoryMinRanks = () => {
      const categoryMinRanks: Record<string, number> = {};
      for (const item of packItems) {
        const categoryId = item.category || '';
        if (!categoryMinRanks[categoryId] || item.rank < categoryMinRanks[categoryId]) {
          categoryMinRanks[categoryId] = item.rank;
        }
      }
      return categoryMinRanks;
    };

    const updateItemRanksToBottom = (
      itemsByCategory: Record<string, PackItem[]>,
      categoryMinRanks: Record<string, number>
    ) => {
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

      return { batch, updatedCount };
    };

    const originalOrder = captureOriginalOrder();
    const itemsByCategory = groupItemsByCategory();
    const categoryMinRanks = findCategoryMinRanks();
    const { batch, updatedCount } = updateItemRanksToBottom(itemsByCategory, categoryMinRanks);

    await batch.commit();

    addUndoAction({
      type: 'move-items',
      description: `Moved ${updatedCount} items to bottom`,
      data: {
        items: selectedItems,
        originalOrder,
      },
    });

    toast({
      title: `Moved ${updatedCount} items to bottom`,
      status: 'success',
    });

    clearSelection();
  }, [selectedItems, packItems, addUndoAction, toast, clearSelection]);

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
