import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { useError, useFirebase } from '../../services/contexts';
import CategoryRow from './CategoryRow';
import { Box, Button, Card, Flex, TextField } from '@radix-ui/themes';
import { firebase } from '../../services/api.ts';

export default function Categories() {
  const categories = useFirebase().categories;
  const [newName, setNewName] = useState<string>('');
  const { setError } = useError();

  function addCategory() {
    (async function () {
      if (!categories.find((t) => t.name === newName)) {
        await firebase.addCategory(newName);
      }
    })().catch(setError);
    setNewName('');
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
  }

  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      addCategory();
    }
  }

  return (
    <Box mt="5" maxWidth="400px">
      <Card>
        {categories.map((item, index) => (
          <CategoryRow category={item} key={index} />
        ))}
        <Flex mt="2" gap="3" align="center">
          <TextField.Root
            size="2"
            placeholder="Enter a category..."
            value={newName}
            onChange={handleOnChange}
            onKeyDown={handleEnter}
          />
          <Button onClick={addCategory}>Add category</Button>
        </Flex>
      </Card>
    </Box>
  );
}
