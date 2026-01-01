import { createContext, useContext } from 'react';
import type { NamedEntity } from '~/types/NamedEntity.ts';
import type { PackItem } from '~/types/PackItem.ts';

export type UndoActionType =
  | 'delete-items'
  | 'delete-checked-items'
  | 'delete-category-items'
  | 'delete-pack-item'
  | 'delete-packing-list'
  | 'reorder-items'
  | 'move-items';

export type UndoScope = 'packing-list' | 'packing-lists';

const PACKING_LISTS_ACTIONS: UndoActionType[] = ['delete-packing-list'];

export function getActionsForScope(scope: UndoScope): UndoActionType[] {
  if (scope === 'packing-lists') {
    return PACKING_LISTS_ACTIONS;
  }
  return [
    'delete-items',
    'delete-checked-items',
    'delete-category-items',
    'delete-pack-item',
    'reorder-items',
    'move-items',
  ];
}

export interface UndoAction {
  id: string;
  type: UndoActionType;
  description: string;
  data: {
    items?: PackItem[];
    packingList?: NamedEntity;
    originalOrder?: Array<{ id: string; rank: number; category: string }>;
  };
  timestamp: number;
}

interface UndoContextType {
  canUndo: (scope?: UndoScope) => boolean;
  undoHistory: UndoAction[];
  getFilteredHistory: (scope: UndoScope) => UndoAction[];
  nextAction: (scope?: UndoScope) => UndoAction | null;
  addUndoAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => void;
  performUndo: (scope?: UndoScope) => Promise<void>;
  getUndoDescription: (scope?: UndoScope) => string | null;
}

export const UndoContext = createContext<UndoContextType | undefined>(undefined);

export function useUndo() {
  const context = useContext(UndoContext);
  if (context === undefined) {
    throw new Error('useUndo must be used within an UndoProvider');
  }
  return context;
}
