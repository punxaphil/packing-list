import { ReactNode, useCallback, useState } from 'react';
import { PackItem } from '~/types/PackItem.ts';
import { SelectModeContext } from './SelectModeContext.ts';

export function SelectModeProvider({ children }: { children: ReactNode }) {
  const [isSelectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<PackItem[]>([]);

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

  return (
    <SelectModeContext.Provider
      value={{
        isSelectMode,
        setSelectMode: handleSetSelectMode,
        selectedItems,
        toggleItemSelection,
        clearSelection,
        isItemSelected,
      }}
    >
      {children}
    </SelectModeContext.Provider>
  );
}
