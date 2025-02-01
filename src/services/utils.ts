import { PackItem } from '../types/PackItem.ts';
import { NamedEntity } from '../types/NamedEntity.ts';

export function getName(members: NamedEntity[], memberId: string) {
  return members.find((t) => t.id === memberId)?.name;
}

export function allChecked(item: PackItem) {
  return !!item.members?.every((t) => t.checked);
}

export function allUnChecked(item: PackItem) {
  return !!item.members?.every((t) => !t.checked);
}
