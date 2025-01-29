import { ChangeEvent, useState } from 'react';
import { Category } from '../../types/Category.ts';
import { firebase } from '../../services/api.ts';
import { Flex, IconButton, TextField } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';
import { useFirebase } from '../../services/contexts.ts';

export default function CategoryRow({ category }: { category: Category }) {
  const [error, setError] = useState('');
  const items = useFirebase().items;

  function changeName(event: ChangeEvent<HTMLInputElement>) {
    (async function () {
      if (category.name !== event.target.value) {
        category.name = event.target.value;
        await firebase.updateCategory(category);
      }
    })().catch(setError);
  }

  function deleteCategory() {
    (async function () {
      for (const item of items) {
        if (item.category === category.id) {
          item.category = undefined;
          await firebase.updateItem(item);
        }
      }
      await firebase.deleteCategory(category.id);
    })().catch(setError);
  }

  return (
    <Flex mt="2" gap="3" align="center">
      <TextField.Root size="2" placeholder="Enter a category…" value={category.name} onChange={changeName} />
      <IconButton radius="full" onClick={deleteCategory} variant="ghost">
        <TrashIcon />
      </IconButton>
      {error && <div className="is-danger">{error}</div>}
    </Flex>
  );
}
