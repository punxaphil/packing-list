import { Input } from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { KeyboardEvent } from 'react';
import { useApi } from '~/providers/ApiContext.ts';
import { useModel } from '~/providers/ModelContext.ts';
import { useNewPackItemRowId } from '~/providers/NewPackItemRowIdContext.ts';
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
  const { setNewPackItemRowId } = useNewPackItemRowId();
  const { packItems, packingList } = useModel();
  const { api } = useApi();

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setNewRowText(e.target.value);
  }

  async function save() {
    if (newRowText) {
      let rank: number;
      const batch = api.initBatch();
      if (packItemToPlaceNewItemAfter) {
        rank = packItemToPlaceNewItemAfter.rank;
        for (const packItem of packItems) {
          packItem.rank = packItem.rank + 1;
          api.updatePackItemBatch(packItem, batch);
          if (packItem.id === packItemToPlaceNewItemAfter.id) {
            break;
          }
        }
      } else {
        rank = rankOnTop(packItems);
      }
      const newId = api.addPackItemBatch(batch, newRowText, [], categoryId, rank, packingList.id);
      setNewPackItemRowId(newId);
      await batch.commit();
    }
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
        value={newRowText}
        onChange={onChange}
        autoFocus
        placeholder="What to pack?"
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        mt="1"
      />
    </PackItemRowWrapper>
  );
}
