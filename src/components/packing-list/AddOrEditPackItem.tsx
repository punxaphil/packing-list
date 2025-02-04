import { Box, Button, Flex, Heading, Input, Text } from '@chakra-ui/react';
import { useError, useFirebase } from '../../services/contexts.ts';
import React, { useState } from 'react';
import { PackItem } from '../../types/PackItem.ts';
import PLSelect from '../shared/PLSelect.tsx';
import PLCheckboxGroup from '../shared/PLCheckboxGroup.tsx';
import { firebase } from '../../services/api.ts';

export function AddOrEditPackItem({ packItem, done }: { packItem?: PackItem; done: () => void }) {
  const { members, categories } = useFirebase();
  const [name, setName] = useState<string>(packItem?.name ?? '');
  const { setError } = useError();
  const [selectedMembers, setSelectedMembers] = useState(packItem?.members ?? []);
  const [category, setCategory] = useState<string>(packItem?.category ?? '');
  const saveAction = packItem ? handleUpdate : handleAdd;

  function handleAdd() {
    (async function () {
      if (!members.find((t) => t.name === name)) {
        await firebase.addPackItem(name, selectedMembers, category);
        done();
      }
    })().catch(setError);
  }

  async function handleUpdate() {
    (async function () {
      if (!packItem) {
        return;
      }
      const updated = { ...packItem, name, members: selectedMembers, category };
      await firebase.updatePackItem(updated);
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
      <Flex gap="3" direction="column">
        <Heading as="h2" size="md">
          {packItem ? 'Edit' : 'Add new'} item
        </Heading>
        <Box maxWidth="300px">
          <Input placeholder="Enter an item name..." value={name} onChange={handleOnChange} onKeyDown={handleEnter} />
        </Box>
        {members.length > 0 && (
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
        )}
        <Box mt="2">
          <Text size="3" as="b">
            Category
          </Text>
          <PLSelect
            setSelection={setCategory}
            selected={category}
            placeholder="Select a category"
            options={categories}
          />
        </Box>
      </Flex>

      <Flex gap="3" align="center" mt="5">
        <Button onClick={saveAction}>{packItem ? 'Update' : 'Add'}</Button>
        {packItem && (
          <Button onClick={done} colorScheme="gray">
            Cancel
          </Button>
        )}
      </Flex>
    </Box>
  );
}
