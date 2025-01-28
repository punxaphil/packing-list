import { ActionType, MemberAction } from '../types/Action.tsx';
import { Member } from '../types/Member.tsx';
import { saveMembers } from './api.ts';
import { v4 } from 'uuid';

export function membersReducer(members: Member[], action: MemberAction) {
  let updatedMembers = members;
  const { Added, Deleted, Changed } = ActionType;
  if (action.type === Added) {
    updatedMembers = action.name ? addMember(members, action.name) : members;
  } else if (action.type === Changed) {
    if (action.newName != null) {
      updatedMembers = changeMember(members, action.member, action.newName);
    }
  } else if (action.type === Deleted) {
    updatedMembers = members.filter((t) => t.id !== action.member?.id);
  } else {
    throw Error(`Unknown action type: ${JSON.stringify(action)}`);
  }
  updatedMembers.sort((a: Member, b: Member) => a.name.localeCompare(b.name));
  saveMembers(updatedMembers);
  return updatedMembers;
}

function addMember(members: Member[], name: string) {
  const nextAvailableId = v4();

  if (members.find((t) => t.name === name)) {
    return members;
  }

  return [
    ...members,
    {
      id: nextAvailableId,
      name,
    },
  ];
}

function changeMember(members: Member[], member?: Member, newName?: string) {
  if (!member || !newName) {
    return members;
  }
  return members.map((t) => {
    if (t.id === member.id) {
      return { ...t, name: newName };
    } else {
      return t;
    }
  });
}
