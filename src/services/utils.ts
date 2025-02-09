import { MemberPackItem } from '../types/MemberPackItem.ts';
import { NamedEntity } from '../types/NamedEntity.ts';
import { PackItem } from '../types/PackItem.ts';

export function getName(members: NamedEntity[], memberId: string) {
  return members.find((t) => t.id === memberId)?.name;
}

export function allChecked(packItem: PackItem) {
  return !!packItem.members?.every((t) => t.checked);
}

export function allUnChecked(packItem: PackItem) {
  return !!packItem.members?.every((t) => !t.checked);
}

export function groupByCategories(packItems: PackItem[]) {
  return packItems.reduce(
    (acc, packItem) => {
      const category = packItem.category ?? '';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(packItem);
      return acc;
    },
    { '': [] } as Record<string, PackItem[]>
  );
}

export function sortAll(members: NamedEntity[], categories: NamedEntity[], packItems: PackItem[]) {
  if (members.length) {
    sortEntities(members);
  }
  if (categories.length) {
    sortEntities(categories);
  }
  if (packItems.length) {
    sortPackItems(packItems, members, categories);
  }
}

export function sortEntities(entities: NamedEntity[]) {
  entities.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
}

export function sortPackItems(packItems: PackItem[], members: NamedEntity[], categories: NamedEntity[]) {
  for (const packItem of packItems) {
    sortPackItemMembersAccordingToMemberRank(members, packItem.members);
  }
  sortPackItemsBasedOnCategoryRank(packItems, categories);

  function sortPackItemMembersAccordingToMemberRank(members: NamedEntity[], itemMembers?: MemberPackItem[]) {
    const getMemberFromId = (mi: MemberPackItem) => members.find((m) => m.id === mi.id);
    itemMembers?.sort((a, b) => (getMemberFromId(a)?.rank ?? 0) - (getMemberFromId(b)?.rank ?? 0));
  }

  function sortPackItemsBasedOnCategoryRank(packItems: PackItem[], categories: NamedEntity[]) {
    const getCategoryFromId = (pi: PackItem) => (pi.category ? categories.find((cat) => cat.id === pi.category) : null);
    packItems.sort((a, b) => {
      return (getCategoryFromId(a)?.rank ?? 0) - (getCategoryFromId(b)?.rank ?? 0);
    });
  }
}
