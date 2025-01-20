import { ActionType, MemberAction } from '../types/Action.tsx';
import { Member } from '../types/Member.tsx';

const STORAGE_KEY = 'members';

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
    updatedMembers = members.filter(t => t.id !== action.member?.id);
  } else {
    throw Error(`Unknown action type: ${JSON.stringify(action)}`);
  }
  saveMembers(updatedMembers);
  return updatedMembers;
}

function addMember(members: Member[], name: string) {
  const nextAvailableId = members.reduce((max, t) => Math.max(max, t.id), 0) + 1;

  if (members.find(t => t.name === name)) {
    return members;
  }

  return [...members, {
    id: nextAvailableId,
    name,
  }];
}

function changeMember(members: Member[], member?: Member, newName?: string) {
  if (!member || !newName) {
    return members;
  }
  return members.map(t => {
    if (t.id === member.id) {
      return { ...t, name: newName };
    } else {
      return t;
    }
  });
}

function saveMembers(members: Member[]) {
  members.sort((a: Member, b: Member) => a.name.localeCompare(b.name));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function initialMembers(): Member[] {
  const localMembers = localStorage.getItem(STORAGE_KEY);
  return localMembers ? JSON.parse(localMembers) as Member[] : [];
}
