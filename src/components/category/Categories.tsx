import { ChangeEvent, useState, KeyboardEvent } from 'react';
import { useCategories, useCategoriesDispatch } from '../../services/contexts';
import { ActionType } from '../../types/Action';
import CategoryRow from './CategoryRow';
import { Box, Button, Card, Flex, TextField } from '@radix-ui/themes';

export default function Categories() {
  const categories = useCategories();
  const dispatch = useCategoriesDispatch();

  const [newName, setNewName] = useState<string>('');

  function handleAdd() {
    dispatch({
      type: ActionType.Added,
      name: newName,
    });
    setNewName('');
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
  }

  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleAdd();
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
          <Button onClick={handleAdd}>Add category</Button>
        </Flex>
      </Card>
    </Box>
  );
}
