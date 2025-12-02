import { useToast } from '@chakra-ui/react';
import type { WriteBatch } from 'firebase/firestore';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { writeDb } from '~/services/database.ts';
import type { NamedEntity } from '~/types/NamedEntity.ts';
import type { PackItem } from '~/types/PackItem.ts';
import { useDatabase } from './DatabaseContext.ts';
import { usePackingList } from './PackingListContext.ts';
import { type UndoAction, UndoContext } from './UndoContext.ts';

interface UndoProviderProps {
  children: ReactNode;
}

// Maximum number of undo actions to keep in history
const MAX_UNDO_HISTORY = 20;

export function UndoProvider({ children }: UndoProviderProps) {
  const [undoHistory, setUndoHistory] = useState<UndoAction[]>([]);
  const { setPackingListId } = usePackingList();
  const { packItems } = useDatabase();
  const toast = useToast();

  const canUndo = undoHistory.length > 0;
  const nextAction = undoHistory.length > 0 ? undoHistory[undoHistory.length - 1] : null;

  function addUndoAction(action: Omit<UndoAction, 'id' | 'timestamp'>) {
    const undoAction: UndoAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setUndoHistory((prev) => {
      const newHistory = [...prev, undoAction];
      // Keep only the most recent MAX_UNDO_HISTORY actions
      return newHistory.length > MAX_UNDO_HISTORY ? newHistory.slice(-MAX_UNDO_HISTORY) : newHistory;
    });
  }

  async function performUndo() {
    if (undoHistory.length === 0) {
      return;
    }

    const actionToUndo = undoHistory[undoHistory.length - 1];

    try {
      switch (actionToUndo.type) {
        case 'delete-items':
        case 'delete-checked-items':
        case 'delete-category-items':
        case 'delete-pack-item':
          if (actionToUndo.data.items) {
            await restoreItems(actionToUndo.data.items);
          }
          break;
        case 'delete-packing-list':
          if (actionToUndo.data.packingList && actionToUndo.data.items) {
            await restorePackingList(actionToUndo.data.packingList, actionToUndo.data.items);
          }
          break;
        case 'reorder-items':
        case 'move-items':
          if (actionToUndo.data.originalOrder) {
            await restoreItemOrder(actionToUndo.data.originalOrder);
          }
          break;
      }

      toast({
        title: 'Undone',
        description: `${actionToUndo.description} has been undone`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Remove the action from history
      setUndoHistory((prev) => prev.slice(0, -1));
    } catch (_error) {
      toast({
        title: 'Undo failed',
        description: 'Unable to undo the last action',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }

  async function restoreItems(items: PackItem[]) {
    const batch = writeDb.initBatch();
    addItemsToBatch(batch, items, items[0]?.packingList);
    await batch.commit();
  }

  async function restorePackingList(packingList: NamedEntity, items: PackItem[]) {
    const batch = writeDb.initBatch();
    const restoredPackingListId = writeDb.addPackingListBatch(packingList.name, batch, packingList.rank);
    addItemsToBatch(batch, items, restoredPackingListId);
    await batch.commit();
    setPackingListId(restoredPackingListId);
  }

  function addItemsToBatch(batch: WriteBatch, items: PackItem[], packingListId: string) {
    for (const item of items) {
      writeDb.addPackItemBatch(batch, item.name, item.members, item.category, item.rank, packingListId, item.checked);
    }
  }

  async function restoreItemOrder(originalOrder: Array<{ id: string; rank: number; category: string }>) {
    const batch = writeDb.initBatch();
    for (const orderInfo of originalOrder) {
      const currentPackItem = packItems.find((item) => item.id === orderInfo.id);
      if (currentPackItem) {
        const updatedPackItem = {
          ...currentPackItem,
          rank: orderInfo.rank,
          category: orderInfo.category,
        };
        writeDb.updatePackItemBatch(updatedPackItem, batch);
      }
    }
    await batch.commit();
  }

  function getUndoDescription() {
    return nextAction ? nextAction.description : null;
  }

  const value = {
    canUndo,
    undoHistory,
    nextAction,
    addUndoAction,
    performUndo,
    getUndoDescription,
  };

  return <UndoContext.Provider value={value}>{children}</UndoContext.Provider>;
}
