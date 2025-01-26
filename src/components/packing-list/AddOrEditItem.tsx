import { useCategories, useItemsDispatch, useMembers } from '../../services/contexts.ts';
import React, { useState } from 'react';
import { ActionType } from '../../types/Action.tsx';
import { Item } from '../../types/Item.tsx';
import { memberIds } from '../../services/utils.ts';
import { MemberSelection } from './MemberSelection.tsx';
import Select from '../shared/Select.tsx';
import { Box, Button, TextField } from '@radix-ui/themes';

export function AddOrEditItem({ item, cancel }: { item?: Item; cancel: () => void }) {
  const members = useMembers();
  const dispatch = useItemsDispatch();
  const [name, setName] = useState<string>(item?.name ?? '');
  const [selectedMembers, setSelectedMembers] = useState<number[]>(memberIds(item) ?? []);
  const [category, setCategory] = useState<number>(item?.categoryId ?? 0);
  const saveAction = item ? handleUpdateItem : handleAdd;
  const categories = useCategories();

  function handleAdd() {
    setName('');
    dispatch({
      type: ActionType.Added,
      name: name,
      memberIds: selectedMembers,
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
      item: { ...item, name, members },
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
    <Box mt="5">
      <div className="is-size-4 mt-3">{item ? 'Edit' : 'Add'} item</div>
      <Box maxWidth="300px">
        <TextField.Root size="2" value={name} onChange={handleOnChange} onKeyDown={handleEnter} />
      </Box>
      <div className="mb-2">
        <div className="mt-2 mb-1 is-size-5">Assign?</div>
        <div className="checkboxes">
          {members.map((member, index) => (
            <MemberSelection
              key={index}
              member={member}
              selectedMembers={selectedMembers}
              setSelectedMembers={setSelectedMembers}
            />
          ))}
        </div>
      </div>
      <div className="mb-5">
        <div className="mt-2 mb-1 is-size-5">Category</div>
        <Select
          setSelection={setCategory}
          value={category}
          options={categories.map((category) => ({
            value: category.id,
            text: category.name,
          }))}
        />
      </div>
      <Button onClick={saveAction} mt="3">
        {item ? 'Update' : 'Add'}
      </Button>
      {item && (
        <Button onClick={cancel} color="crimson" ml="3">
          Cancel
        </Button>
      )}
    </Box>
  );
}
