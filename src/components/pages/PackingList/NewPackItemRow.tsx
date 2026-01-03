import { Input } from '@chakra-ui/react';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useNewPackItemRowId } from '~/providers/NewPackItemRowIdContext.ts';
import { handleEnter } from '~/services/utils.ts';
import { PackItem } from '~/types/PackItem.ts';
import { PackItemRowWrapper } from './PackItemRowWrapper.tsx';

const isEnterPressed = { current: false };

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
  const { addLocalPackItem, savePendingItems } = useDatabase();
  const inputRef = useRef<HTMLInputElement>(null);
  const isReadyForBlur = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      isReadyForBlur.current = true;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setNewRowText(e.target.value);
  }

  async function save() {
    if (newRowText) {
      const newId = addLocalPackItem(newRowText, categoryId, packItemToPlaceNewItemAfter?.id);
      setNewPackItemRowId(newId);
      setNewRowText('');
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, async () => {
      isEnterPressed.current = true;
      await save();
      setTimeout(() => {
        isEnterPressed.current = false;
      }, 100);
    });
    if (e.key === 'Escape') {
      savePendingItems();
      onHide();
    }
  }

  function onBlur() {
    if (!isReadyForBlur.current) {
      return;
    }
    const wasEnterPressed = isEnterPressed.current;
    isEnterPressed.current = false;

    if (!wasEnterPressed) {
      if (newRowText) {
        save().catch(console.error);
      }
    }
    savePendingItems();
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
    </PackItemRowWrapper>
  );
}
