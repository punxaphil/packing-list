import { ChangeEvent, KeyboardEvent, useState } from 'react';
import MemberRow from './MemberRow.tsx';
import { useMembers, useMembersDispatch } from '../services/contexts.ts';
import { ActionType } from '../types/Action.tsx';

export default function Members() {
  const members = useMembers();
  const dispatch = useMembersDispatch();
  const [newName, setNewName] = useState<string>('');

  function handleAdd() {
    setNewName('');
    dispatch({
      type: ActionType.Added,
      name: newName,
    });
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
    <div className="card p-3">
      {members.map((item, index) =>
        <MemberRow member={item} key={index} />)}
      <div className="mt-4 is-flex">
        <input type="text" value={newName} onChange={handleOnChange} onKeyDown={handleEnter} className="input"
        ></input>
        <button onClick={handleAdd} className="button is-light is-success mx-2">
          Add member
        </button>
      </div>
    </div>
  );
}
