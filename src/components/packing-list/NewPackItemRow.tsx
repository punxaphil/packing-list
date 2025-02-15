import { Checkbox, Flex, Input } from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { KeyboardEvent } from 'react';
import { firebase } from '../../services/firebase.ts';
import { handleEnter } from '../../services/utils.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { PackItemRowWrapper } from './PackItemRowWrapper.tsx';

export function NewPackItemRow({ categoryId, onHide }: { categoryId: string; onHide: () => void }) {
  const [newRowText, setNewRowText] = useState('');
  const { packingListId } = usePackingListId();

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    setNewRowText(e.target.value);
  }

  async function onBlur() {
    if (newRowText) {
      await firebase.addPackItem(newRowText, [], categoryId, packingListId);
    }
    onHide();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, async () => {
      await onBlur();
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
          onBlur={onBlur}
          onKeyDown={onKeyDown}
        />
      </Flex>
    </PackItemRowWrapper>
  );
}
