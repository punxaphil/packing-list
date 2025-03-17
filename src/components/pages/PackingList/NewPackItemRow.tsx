import { Input } from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { KeyboardEvent } from 'react';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useNewPackItemRowId } from '~/providers/NewPackItemRowIdContext.ts';
import { usePackingList } from '~/providers/PackingListContext.ts';
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
  const packItems = useDatabase().packItems;

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setNewRowText(e.target.value);
  }

  async function save() {
    if (newRowText) {
      let rank: number;
      const batch = writeDb.initBatch();
      if (packItemToPlaceNewItemAfter) {
        rank = packItemToPlaceNewItemAfter.rank;
        for (const packItem of packItems) {
          packItem.rank = packItem.rank + 1;
          writeDb.updatePackItemBatch(packItem, batch);
          if (packItem.id === packItemToPlaceNewItemAfter.id) {
            break;
          }
        }
      } else {
        rank = rankOnTop(packItems);
      }
      const newId = writeDb.addPackItemBatch(batch, newRowText, [], categoryId, rank, packingList.id);
      setNewPackItemRowId(newId);
      await batch.commit();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, async () => {
      await save();
    });
    if (e.key === 'Escape' || e.key === 'Tab') {
      onHide();
    }
  }

  return (
    <PackItemRowWrapper>
      <Input
        value={newRowText}
        onChange={onChange}
        autoFocus
        placeholder="What to pack?"
        onBlur={onHide}
        onKeyDown={onKeyDown}
        mt="1"
      />
    </PackItemRowWrapper>
  );
}
