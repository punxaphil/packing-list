import { createContext, useContext } from 'react';
import type { NamedEntity } from '~/types/NamedEntity.ts';
import type { PackItem } from '~/types/PackItem.ts';

export type SyncActionType = 'rename' | 'delete' | 'add' | 'move-category' | 'members';

export type UndoScope = 'packing-list' | 'packing-lists';

export interface TemplateContextType {
  templateList: NamedEntity | null;
  templateItems: PackItem[];
  isTemplateList: (listId: string) => boolean;
  getTemplateItemByName: (name: string) => PackItem | undefined;
  getSyncDecision: (actionType: SyncActionType) => boolean | null;
  setSyncDecision: (actionType: SyncActionType, decision: boolean, remember: boolean) => void;
  clearSyncDecisions: () => void;
  refreshTemplateItems: () => Promise<void>;
  shouldShowSyncDialog: (packItem: PackItem, actionType: SyncActionType) => boolean;
  shouldShowSyncDialogForAdd: () => boolean;
  getMatchingItemsForSync: (packItem: PackItem) => Promise<PackItem[]>;
}

export const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}
