import { createContext, useContext } from 'react';
import type { NamedEntity } from '~/types/NamedEntity.ts';
import type { PackItem } from '~/types/PackItem.ts';

export interface UndoAction {
  id: string;
  type: 'delete-items' | 'delete-checked-items' | 'delete-category-items' | 'delete-pack-item' | 'delete-packing-list';
  description: string;
  data: {
    items?: PackItem[];
    packingList?: NamedEntity;
  };
  timestamp: number;
}

interface UndoContextType {
  canUndo: boolean;
  undoHistory: UndoAction[];
  nextAction: UndoAction | null;
  addUndoAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => void;
  performUndo: () => Promise<void>;
  getUndoDescription: () => string | null;
}

export const UndoContext = createContext<UndoContextType | undefined>(undefined);

export function useUndo() {
  const context = useContext(UndoContext);
  if (context === undefined) {
    throw new Error('useUndo must be used within an UndoProvider');
  }
  return context;
}
