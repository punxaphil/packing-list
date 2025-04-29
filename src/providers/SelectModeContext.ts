import { createContext, useContext } from 'react';
import { PackItem } from '~/types/PackItem.ts';

interface SelectModeContextType {
  isSelectMode: boolean;
  setSelectMode: (value: boolean) => void;
  selectedItems: PackItem[];
  toggleItemSelection: (packItem: PackItem) => void;
  clearSelection: () => void;
  isItemSelected: (packItem: PackItem) => boolean;
}

export const SelectModeContext = createContext<SelectModeContextType | undefined>(undefined);

export function useSelectMode() {
  const context = useContext(SelectModeContext);
  if (context === undefined) {
    throw new Error('useSelectMode must be used within a SelectModeProvider');
  }
  return context;
}
