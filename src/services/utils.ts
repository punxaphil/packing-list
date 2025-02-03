import { PackItem } from '../types/PackItem.ts';
import { NamedEntity } from '../types/NamedEntity.ts';
import { MemberItem } from '../types/MemberItem.ts';

export function getName(members: NamedEntity[], memberId: string) {
  return members.find((t) => t.id === memberId)?.name;
}

export function allChecked(item: PackItem) {
  return !!item.members?.every((t) => t.checked);
}

export function allUnChecked(item: PackItem) {
  return !!item.members?.every((t) => !t.checked);
}

export function sortItemsBasedOnCategoryOrder(items: PackItem[], categories: NamedEntity[]) {
  const getCategoryFromId = (pi: PackItem) => (pi.category ? categories.find((cat) => cat.id === pi.category) : null);
  items.sort((a, b) => {
    return (getCategoryFromId(a)?.order ?? 0) - (getCategoryFromId(b)?.order ?? 0);
  });
}

export function sortItemMembersAccordingToMemberOrder(members: NamedEntity[], itemMembers?: MemberItem[]) {
  const getMemberFromId = (mi: MemberItem) => members.find((m) => m.id === mi.id);
  itemMembers?.sort((a, b) => (getMemberFromId(a)?.order ?? 0) - (getMemberFromId(b)?.order ?? 0));
}

export function groupByCategories(items: PackItem[]) {
  return items.reduce(
    (acc, item) => {
      const category = item.category ?? '';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    { '': [] } as Record<string, PackItem[]>
  );
}
