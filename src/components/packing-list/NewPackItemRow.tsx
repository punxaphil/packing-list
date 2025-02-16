import { Checkbox, Flex, Input } from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { KeyboardEvent } from 'react';
import { firebase } from '../../services/firebase.ts';
import { handleEnter } from '../../services/utils.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { PackItemRowWrapper } from './PackItemRowWrapper.tsx';

export function NewPackItemRow({ categoryId, onHide }: { categoryId: string; onHide: () => void }) {
  const [newRowText, setNewRowText] = useState('');
  const { packingListId } = usePackingListId();
  const packItems = useFirebase().packItems;

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setNewRowText(e.target.value);
  }

  async function save() {
    onHide();
    if (newRowText) {
      const nextRank = packItems.length;
      await firebase.addPackItem(newRowText, [], categoryId, packingListId, nextRank);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, async () => {
      await save();
    });
  }

  return (
    <PackItemRowWrapper indent={!!categoryId}>
      <Flex gap="3" align="center">
        <Checkbox disabled />
        <Input
          value={newRowText}
          onChange={onChange}
          autoFocus
          placeholder="What to pack?"
          onBlur={save}
          onKeyDown={onKeyDown}
        />
      </Flex>
    </PackItemRowWrapper>
  );
}
