import { useCategories, useItemsDispatch, useMembers } from '../../services/contexts.ts';
import React, { useState } from 'react';
import { ActionType } from '../../types/Action.tsx';
import { Item } from '../../types/Item.tsx';
import { memberIds } from '../../services/utils.ts';
import PLSelect from '../shared/PLSelect.tsx';
import { Box, Button, Flex, Heading, Text, TextField } from '@radix-ui/themes';
import PLCheckboxGroup from '../shared/PLCheckboxGroup.tsx';

export function AddOrEditItem({ item, cancel }: { item?: Item; cancel: () => void }) {
  const members = useMembers();
  const dispatch = useItemsDispatch();
  const [name, setName] = useState<string>(item?.name ?? '');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(memberIds(item) ?? []);
  const [category, setCategory] = useState<string>(item?.category ?? '');
  const saveAction = item ? handleUpdateItem : handleAdd;
  const categories = useCategories();

  function handleAdd() {
    setName('');
    setCategory('');
    dispatch({
      type: ActionType.Added,
      name: name,
      memberIds: selectedMembers,
      category: category,
    });
  }

  function handleUpdateItem() {
    if (!item) {
      return;
    }
    let members = item.members?.filter((m) => !!selectedMembers.find((t) => t === m.id)) ?? [];
    members = [
      ...members,
      ...selectedMembers
        .filter((t) => !members.find((m) => m.id === t))
        .map((id) => ({
          id: id,
          checked: false,
        })),
    ];
    dispatch({
      type: ActionType.Changed,
      item: { ...item, name, members, category },
    });
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      saveAction();
    }
  }

  return (
    <Box>
      <Heading as="h2">{item ? 'Edit' : 'Add new'} item</Heading>
      <Box maxWidth="300px">
        <TextField.Root
          size="2"
          placeholder="Enter a item name..."
          value={name}
          onChange={handleOnChange}
          onKeyDown={handleEnter}
        />
      </Box>
      <Box mt="2">
        <Text size="3" weight="bold">
          Assign
        </Text>
        <PLCheckboxGroup
          setSelection={setSelectedMembers}
          selected={selectedMembers}
          options={members.map((member) => ({
            value: member.id,
            text: member.name,
          }))}
        ></PLCheckboxGroup>
      </Box>
      <Box mt="2">
        <Text size="3" weight="bold">
          Category
        </Text>
        <PLSelect
          setSelection={setCategory}
          selected={category}
          placeholder="Select a category"
          options={categories.map((category) => ({
            value: category.id,
            text: category.name,
          }))}
        />
      </Box>

      <Flex gap="3" align="center" mt="5">
        <Button onClick={saveAction}>{item ? 'Update' : 'Add'}</Button>
        {item && (
          <Button onClick={cancel} color="crimson">
            Cancel
          </Button>
        )}
      </Flex>
    </Box>
  );
}
