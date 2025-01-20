import { ImCross } from '@react-icons/all-files/im/ImCross';
import { ChangeEvent } from 'react';
import { useMembersDispatch } from '../services/contexts.ts';
import { ActionType } from '../types/Action.tsx';
import { Member } from '../types/Member.tsx';

export default function MemberRow({ member }: { member: Member }) {
  const dispatch = useMembersDispatch();

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch({
      type: ActionType.Changed,
      member,
      newName: event.target.value,
    });
  }

  function onRemove() {
    dispatch({
      type: ActionType.Deleted,
      member,
    });
  }

  return (
    <div className="is-flex my-1">
      <input type="text" value={member.name} onChange={handleOnChange} className="input"></input>
      <ImCross onClick={onRemove} className="is-small mx-1" />
    </div>
  );

}

