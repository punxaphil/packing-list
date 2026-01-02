import { Input, useDisclosure } from '@chakra-ui/react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { AddSyncDialog } from '~/components/shared/AddSyncDialog.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useNewPackItemRowId } from '~/providers/NewPackItemRowIdContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { useTemplate } from '~/providers/TemplateContext.ts';
import { writeDb } from '~/services/database.ts';
import { handleEnter, rankOnTop } from '~/services/utils.ts';
import { PackItem } from '~/types/PackItem.ts';
import { PackItemRowWrapper } from './PackItemRowWrapper.tsx';

export function NewPackItemRow({
  categoryId,
  onHide,
  packItemToPlaceNewItemAfter,
}: {
  categoryId: string;
  onHide: () => void;
  packItemToPlaceNewItemAfter?: PackItem;
}) {
  const [newRowText, setNewRowText] = useState('');
  const { packingList } = usePackingList();
  const { setNewPackItemRowId } = useNewPackItemRowId();
  const { packItems, packingLists } = useDatabase();
  const { shouldShowSyncDialogForAdd, getSyncDecision, templateList, templateItems, isTemplateList } = useTemplate();
  const syncDialog = useDisclosure();
  const [pendingItemName, setPendingItemName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setNewRowText(e.target.value);
  }

  async function addToTemplate(itemName: string) {
    if (!templateList) {
      return;
    }
    const rank = rankOnTop(templateItems);
    const batch = writeDb.initBatch();
    writeDb.addPackItemBatch(batch, itemName, [], categoryId, rank, templateList.id);
    await batch.commit();
  }

  async function addToAllOtherLists(itemName: string) {
    const batch = writeDb.initBatch();
    for (const list of packingLists) {
      if (list.id !== packingList.id) {
        const rank = rankOnTop(packItems.filter((p) => p.packingList === list.id));
        writeDb.addPackItemBatch(batch, itemName, [], categoryId, rank, list.id);
      }
    }
    await batch.commit();
  }

  async function save() {
    if (newRowText) {
      let rank: number;
      const batch = writeDb.initBatch();
      if (packItemToPlaceNewItemAfter) {
        rank = packItemToPlaceNewItemAfter.rank;
        for (const packItem of packItems) {
          if (packItem.rank < rank) {
            packItem.rank = packItem.rank - 1;
            writeDb.updatePackItemBatch(packItem, batch);
          }
        }
        rank = rank - 1;
      } else {
        rank = rankOnTop(packItems);
      }
      const newId = writeDb.addPackItemBatch(batch, newRowText, [], categoryId, rank, packingList.id);
      setNewPackItemRowId(newId);
      await batch.commit();

      const itemName = newRowText;
      const decision = getSyncDecision('add');
      if (decision !== null) {
        if (decision) {
          if (isTemplateList(packingList.id)) {
            await addToAllOtherLists(itemName);
          } else {
            await addToTemplate(itemName);
          }
        }
        return;
      }

      if (shouldShowSyncDialogForAdd()) {
        setPendingItemName(itemName);
        syncDialog.onOpen();
      }
    }
  }

  async function handleSyncConfirm(shouldSync: boolean) {
    if (shouldSync && pendingItemName) {
      if (isTemplateList(packingList.id)) {
        await addToAllOtherLists(pendingItemName);
      } else {
        await addToTemplate(pendingItemName);
      }
    }
    setPendingItemName(null);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, async () => {
      await save();
    });
    if (e.key === 'Escape') {
      onHide();
    }
  }

  function onBlur() {
    if (newRowText) {
      save().catch(console.error);
    }
    onHide();
  }

  return (
    <PackItemRowWrapper>
      <Input
        ref={inputRef}
        value={newRowText}
        onChange={onChange}
        placeholder="What to pack?"
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        mt="1"
        enterKeyHint="done"
        inputMode="text"
      />
      <AddSyncDialog
        isOpen={syncDialog.isOpen}
        onClose={syncDialog.onClose}
        isTemplateChange={isTemplateList(packingList.id)}
        itemName={pendingItemName ?? ''}
        onConfirm={handleSyncConfirm}
      />
    </PackItemRowWrapper>
  );
}
