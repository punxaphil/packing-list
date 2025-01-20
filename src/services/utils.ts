import { Item } from '../types/Item.tsx';
import { Member } from '../types/Member.tsx';

export function memberIds(item?: Item): number[] | undefined {
  return item?.members?.map(m => m.id);
}

export function getName(members: Member[], memberId: number) {
  return members.find(t => t.id === memberId)?.name;
}

export function allChecked(item: Item) {
  return !!(item.members?.every(t => t.checked));
}
