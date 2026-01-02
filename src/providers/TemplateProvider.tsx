import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { writeDb } from '~/services/database.ts';
import type { PackItem } from '~/types/PackItem.ts';
import { useDatabase } from './DatabaseContext.ts';
import { type SyncActionType, TemplateContext } from './TemplateContext.ts';

interface TemplateProviderProps {
  children: ReactNode;
}

const SYNC_DECISION_PREFIX = 'templateSync_';

export function TemplateProvider({ children }: TemplateProviderProps) {
  const { packingLists } = useDatabase();
  const [templateItems, setTemplateItems] = useState<PackItem[]>([]);

  const templateList = useMemo(() => {
    return packingLists.find((list) => list.isTemplate) ?? null;
  }, [packingLists]);

  const loadTemplateItems = useCallback(async () => {
    if (!templateList) {
      return;
    }
    const items = await writeDb.getPackItemsForPackingList(templateList.id);
    setTemplateItems(items);
  }, [templateList]);

  useEffect(() => {
    if (templateList) {
      loadTemplateItems();
    } else {
      setTemplateItems([]);
    }
  }, [templateList, loadTemplateItems]);

  const isTemplateList = useCallback(
    (listId: string) => {
      return templateList?.id === listId;
    },
    [templateList]
  );

  const getTemplateItemByName = useCallback(
    (name: string) => {
      return templateItems.find((item) => item.name === name);
    },
    [templateItems]
  );

  const getSyncDecision = useCallback((actionType: SyncActionType): boolean | null => {
    const stored = sessionStorage.getItem(`${SYNC_DECISION_PREFIX}${actionType}`);
    if (stored === null) {
      return null;
    }
    return stored === 'true';
  }, []);

  const setSyncDecision = useCallback((actionType: SyncActionType, decision: boolean, remember: boolean) => {
    if (remember) {
      sessionStorage.setItem(`${SYNC_DECISION_PREFIX}${actionType}`, String(decision));
    }
  }, []);

  const clearSyncDecisions = useCallback(() => {
    for (const actionType of ['rename', 'delete', 'add', 'move-category', 'members'] as SyncActionType[]) {
      sessionStorage.removeItem(`${SYNC_DECISION_PREFIX}${actionType}`);
    }
  }, []);

  const refreshTemplateItems = useCallback(async () => {
    if (templateList) {
      const items = await writeDb.getPackItemsForPackingList(templateList.id);
      setTemplateItems(items);
    }
  }, [templateList]);

  const shouldShowSyncDialog = useCallback(
    (packItem: PackItem, actionType: SyncActionType): boolean => {
      const rememberedDecision = getSyncDecision(actionType);
      if (rememberedDecision !== null) {
        return false;
      }

      const isFromTemplate = isTemplateList(packItem.packingList);
      if (isFromTemplate) {
        return true;
      }

      return getTemplateItemByName(packItem.name) !== undefined;
    },
    [getSyncDecision, isTemplateList, getTemplateItemByName]
  );

  const shouldShowSyncDialogForAdd = useCallback((): boolean => {
    if (!templateList) {
      return false;
    }
    const rememberedDecision = getSyncDecision('add');
    return rememberedDecision === null;
  }, [templateList, getSyncDecision]);

  const getMatchingItemsForSync = useCallback(
    async (packItem: PackItem): Promise<PackItem[]> => {
      const isFromTemplate = isTemplateList(packItem.packingList);
      if (isFromTemplate) {
        const allItems = await writeDb.getPackItemsForAllPackingLists();
        return allItems.filter((item) => item.name === packItem.name && item.packingList !== packItem.packingList);
      }
      const templateItem = getTemplateItemByName(packItem.name);
      return templateItem ? [templateItem] : [];
    },
    [isTemplateList, getTemplateItemByName]
  );

  const value = useMemo(
    () => ({
      templateList,
      templateItems,
      isTemplateList,
      getTemplateItemByName,
      getSyncDecision,
      setSyncDecision,
      clearSyncDecisions,
      refreshTemplateItems,
      shouldShowSyncDialog,
      shouldShowSyncDialogForAdd,
      getMatchingItemsForSync,
    }),
    [
      templateList,
      templateItems,
      isTemplateList,
      getTemplateItemByName,
      getSyncDecision,
      setSyncDecision,
      clearSyncDecisions,
      refreshTemplateItems,
      shouldShowSyncDialog,
      shouldShowSyncDialogForAdd,
      getMatchingItemsForSync,
    ]
  );

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}
