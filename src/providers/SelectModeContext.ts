import { createContext, useContext } from 'react';
import { PackItem } from '~/types/PackItem.ts';

interface SelectModeContextType {
  isSelectMode: boolean;
  isTransitioning: boolean;
  setSelectMode: (value: boolean) => void;
  selectedItems: PackItem[];
  toggleItemSelection: (packItem: PackItem, shiftKey?: boolean) => void;
  clearSelection: () => void;
  isItemSelected: (packItem: PackItem) => boolean;
  moveSelectedItemsToTop: () => Promise<void>;
  moveSelectedItemsToBottom: () => Promise<void>;
  selectAllInCategory: (categoryId: string) => void;
  deselectAllInCategory: (categoryId: string) => void;
  lastSelectedItem: PackItem | null;
}

export const SelectModeContext = createContext<SelectModeContextType | undefined>(undefined);

export function useSelectMode() {
  const context = useContext(SelectModeContext);
  if (context === undefined) {
    throw new Error('useSelectMode must be used within a SelectModeProvider');
  }
  return context;
}
