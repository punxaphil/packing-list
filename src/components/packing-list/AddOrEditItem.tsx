import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import { useError, useFirebase } from '../../services/contexts.ts';
import React, { useState } from 'react';
import { PackItem } from '../../types/PackItem.ts';
import PLSelect from '../shared/PLSelect.tsx';
import PLCheckboxGroup from '../shared/PLCheckboxGroup.tsx';
import { firebase } from '../../services/api.ts';

export function AddOrEditItem({ item, done }: { item?: PackItem; done: () => void }) {
  const { members, categories } = useFirebase();
  const [name, setName] = useState<string>(item?.name ?? '');
  const { setError } = useError();
  const [selectedMembers, setSelectedMembers] = useState(item?.members ?? []);
  const [category, setCategory] = useState<string>(item?.category ?? '');
  const saveAction = item ? handleUpdateItem : handleAdd;

  function handleAdd() {
    (async function () {
      if (!members.find((t) => t.name === name)) {
        await firebase.addItem(name, selectedMembers, category);
        done();
      }
    })().catch(setError);
  }

  async function handleUpdateItem() {
    (async function () {
      if (!item) {
        return;
      }
      const updated = { ...item, name, members: selectedMembers, category };
      await firebase.updateItem(updated);
      done();
    })().catch(setError);
  }

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      saveAction();
    }
  }

  function onMembersSelection(selectedIds: string[]) {
    const newMembers = selectedIds.map((id) => {
      const checked = !!selectedMembers.find((current) => current.id === id)?.checked;
      return { checked, id };
    });
    setSelectedMembers(newMembers);
  }

  return (
    <Box>
      <Heading as="h2">{item ? 'Edit' : 'Add new'} item</Heading>
      <Box maxWidth="300px">
        <Input
          size="2"
          placeholder="Enter a item name..."
          value={name}
          onChange={handleOnChange}
          onKeyDown={handleEnter}
        />
      </Box>
      <Box mt="2">
        <Text size="3" as="b">
          Assign
        </Text>
        <PLCheckboxGroup
          setSelection={onMembersSelection}
          selected={selectedMembers.map((m) => m.id)}
          options={members}
        />
      </Box>
      <Box mt="2">
        <Text size="3" as="b">
          NamedEntity
        </Text>
        <PLSelect setSelection={setCategory} selected={category} placeholder="Select a category" options={categories} />
      </Box>

      <Flex gap="3" align="center" mt="5">
        <Button onClick={saveAction}>{item ? 'Update' : 'Add'}</Button>
        {item && (
          <Button onClick={done} color="crimson">
            Cancel
          </Button>
        )}
      </Flex>
    </Box>
  );
}
