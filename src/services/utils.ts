import { Item } from '../types/Item.ts';
import { Member } from '../types/Member.ts';

export function getName(members: Member[], memberId: string) {
  return members.find((t) => t.id === memberId)?.name;
}

export function allChecked(item: Item) {
  return !!item.members?.every((t) => t.checked);
}

export function allUnChecked(item: Item) {
  return !!item.members?.every((t) => !t.checked);
}
