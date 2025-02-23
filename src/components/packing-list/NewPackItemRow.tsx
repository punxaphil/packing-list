import { Input } from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { KeyboardEvent } from 'react';
import { firebase } from '../../services/firebase.ts';
import { handleEnter, rankOnTop } from '../../services/utils.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { PackItemRowWrapper } from './PackItemRowWrapper.tsx';

export function NewPackItemRow({ categoryId, onHide }: { categoryId?: string; onHide: () => void }) {
  const [newRowText, setNewRowText] = useState('');
  const { packingListId } = usePackingListId();
  const packItems = useFirebase().packItems;

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setNewRowText(e.target.value);
  }

  async function save() {
    if (newRowText) {
      const nextRank = rankOnTop(packItems);
      await firebase.addPackItem(newRowText, [], categoryId ?? '', packingListId, nextRank);
      setNewRowText('');
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
