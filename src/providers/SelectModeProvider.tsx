import { useToast } from '@chakra-ui/react';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { writeDb } from '~/services/database.ts';
import { PackItem } from '~/types/PackItem.ts';
import { useDatabase } from './DatabaseContext.ts';
import { SelectModeContext } from './SelectModeContext.ts';
import { useUndo } from './UndoContext.ts';

const SPINNER_DELAY_MS = 150;

export function SelectModeProvider({ children }: { children: ReactNode }) {
  const [isSelectMode, setSelectMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedItems, setSelectedItems] = useState<PackItem[]>([]);
  const [lastSelectedItem, setLastSelectedItem] = useState<PackItem | null>(null);
  const spinnerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { packItems, groupedPackItems } = useDatabase();
  const { addUndoAction } = useUndo();
  const toast = useToast();

  const visualOrderItems = useMemo(() => {
    const items: PackItem[] = [];
    for (const group of groupedPackItems) {
      for (const item of group.packItems) {
        items.push(item);
      }
    }
    return items;
  }, [groupedPackItems]);

  const toggleItemSelection = useCallback(
    (packItem: PackItem, shiftKey = false) => {
      if (shiftKey && lastSelectedItem) {
        const lastIndex = visualOrderItems.findIndex((item) => item.id === lastSelectedItem.id);
        const currentIndex = visualOrderItems.findIndex((item) => item.id === packItem.id);

        if (lastIndex !== -1 && currentIndex !== -1) {
          const startIndex = Math.min(lastIndex, currentIndex);
          const endIndex = Math.max(lastIndex, currentIndex);
          const itemsInRange = visualOrderItems.slice(startIndex, endIndex + 1);

          setSelectedItems((currentSelectedItems) => {
            const newSelection = [...currentSelectedItems];
            for (const item of itemsInRange) {
              if (!newSelection.some((s) => s.id === item.id)) {
                newSelection.push(item);
              }
            }
            return newSelection;
          });
          setLastSelectedItem(packItem);
          return;
        }
      }
      setSelectedItems((currentSelectedItems) => {
        const isAlreadySelected = currentSelectedItems.some((item) => item.id === packItem.id);
        if (isAlreadySelected) {
          return currentSelectedItems.filter((item) => item.id !== packItem.id);
        }
        return [...currentSelectedItems, packItem];
      });
      setLastSelectedItem(packItem);
    },
    [lastSelectedItem, visualOrderItems]
  );

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
    setLastSelectedItem(null);
  }, []);

  const isItemSelected = useCallback(
    (packItem: PackItem) => {
      return selectedItems.some((item) => item.id === packItem.id);
    },
    [selectedItems]
  );

  const selectAllInCategory = useCallback(
    (categoryId: string) => {
      const itemsInCategory = packItems.filter((item) => (item.category || '') === categoryId);
      setSelectedItems((currentSelectedItems) => {
        const newSelection = [...currentSelectedItems];
        for (const item of itemsInCategory) {
          if (!newSelection.some((s) => s.id === item.id)) {
            newSelection.push(item);
          }
        }
        return newSelection;
      });
    },
    [packItems]
  );

  const deselectAllInCategory = useCallback((categoryId: string) => {
    setSelectedItems((currentSelectedItems) => {
      return currentSelectedItems.filter((item) => (item.category || '') !== categoryId);
    });
  }, []);

  const handleSetSelectMode = (value: boolean) => {
    spinnerTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(true);
    }, SPINNER_DELAY_MS);
    setTimeout(() => {
      setSelectMode(value);
      if (!value) {
        clearSelection();
      }
      if (spinnerTimeoutRef.current) {
        clearTimeout(spinnerTimeoutRef.current);
      }
      setIsTransitioning(false);
    }, 0);
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
        isTransitioning,
        setSelectMode: handleSetSelectMode,
        selectedItems,
        toggleItemSelection,
        clearSelection,
        isItemSelected,
        moveSelectedItemsToTop,
        moveSelectedItemsToBottom,
        selectAllInCategory,
        deselectAllInCategory,
        lastSelectedItem,
      }}
    >
      {children}
    </SelectModeContext.Provider>
  );
}
