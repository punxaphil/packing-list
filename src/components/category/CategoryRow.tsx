import { ChangeEvent } from 'react';
import { useCategoriesDispatch } from '../../services/contexts.ts';
import { ActionType } from '../../types/Action.tsx';
import { Category } from '../../types/Category.tsx';
import { Flex, IconButton, TextField } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';

export default function CategoryRow({ category }: { category: Category }) {
  const dispatch = useCategoriesDispatch();

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch({
      type: ActionType.Changed,
      category,
      newName: event.target.value,
    });
  }

  function onRemove() {
    dispatch({
      type: ActionType.Deleted,
      category,
    });
  }

  return (
    <Flex mt="2" gap="3" align="center">
      <TextField.Root size="2" placeholder="Enter a category…" value={category.name} onChange={handleOnChange} />
      <IconButton radius="full" onClick={onRemove} variant="ghost">
        <TrashIcon />
      </IconButton>
    </Flex>
  );
}
