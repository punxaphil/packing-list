import { useItemsDispatch, useMembers } from '../services/contexts.ts';
import React, { useState } from 'react';
import { ActionType } from '../types/Action.tsx';
import { Item } from '../types/Item.tsx';
import { memberIds } from '../services/utils.ts';
import { MemberSelection } from './MemberSelection.tsx';

export function AddOrEditItem({ item, cancel }: { item?: Item, cancel: () => void }) {
  const members = useMembers();
  const dispatch = useItemsDispatch();
  const [name, setName] = useState<string>(item?.name ?? '');
  const [selectedMembers, setSelectedMembers] = useState<number[]>(memberIds(item) ?? []);
  const saveAction = item ? handleUpdateItem : handleAdd;

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
    let members = item.members?.filter(m => !!selectedMembers.find(t => t === m.id)) ?? [];
    members = [...members, ...selectedMembers.filter(t => !members.find(m => m.id === t)).map(id => ({
      id: id,
      checked: false,
    }))];
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
    <div className="box m-5">
      <div className="is-size-4 mt-3">{item ? 'Edit' : 'Add'} item</div>
      <input className={'input'} type="text" value={name} onChange={handleOnChange} onKeyDown={handleEnter}></input>
      <div className="mb-2">
        <div className="mt-2 mb-1 is-size-5">Assign?</div>
        <div className="checkboxes">
          {members.map((member, index) =>
            <MemberSelection key={index} member={member} selectedMembers={selectedMembers}
                             setSelectedMembers={setSelectedMembers} />,
          )}
        </div>
      </div>
      <button onClick={saveAction} className="button is-light is-success">
        {item ? 'Update' : 'Add'}
      </button>
      {item &&
        <button onClick={cancel} className="button is-light is-danger mx-2">
          Cancel
        </button>
      }

    </div>
  );
}
