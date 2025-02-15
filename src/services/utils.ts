import { KeyboardEvent } from 'react';
import { GroupedPackItem } from '../types/GroupedPackItem.ts';
import { MemberPackItem } from '../types/MemberPackItem.ts';
import { NamedEntity } from '../types/NamedEntity.ts';
import { PackItem } from '../types/PackItem.ts';

export function getName(members: NamedEntity[], memberId?: string) {
  return members.find((t) => t.id === memberId)?.name;
}

export function allChecked(packItem: PackItem) {
  return !!packItem.members?.every((t) => t.checked);
}

export function allUnChecked(packItem: PackItem) {
  return !!packItem.members?.every((t) => !t.checked);
}

function getCategoryRank(catId: string, categories: NamedEntity[]) {
  const category = categories.find((c) => c.id === (catId ?? ''));
  return category?.rank ?? -1;
}

export function groupByCategories(packItems: PackItem[], categories: NamedEntity[]) {
  const result: GroupedPackItem[] = [];
  for (const packItem of packItems) {
    const find = result.find((r) => r.categoryId === packItem.category);
    if (!find) {
      result.push({
        categoryId: packItem.category ?? '',
        packItems: [packItem],
      });
    } else {
      find.packItems.push(packItem);
    }
  }
  return result.sort((a, b) => getCategoryRank(a.categoryId, categories) - getCategoryRank(b.categoryId, categories));
}

export function sortAll(
  members: NamedEntity[],
  categories: NamedEntity[],
  packItems: PackItem[],
  packingLists: NamedEntity[]
) {
  if (members.length) {
    sortEntities(members);
  }
  if (categories.length) {
    sortEntities(categories);
  }
  if (packingLists.length) {
    sortEntities(packingLists);
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

export function handleEnter(e: KeyboardEvent<HTMLInputElement>, onEnter: () => void) {
  if (e.key === 'Enter') {
    onEnter();
  }
}

export function findUniqueName(
  baseName: string,
  namedList: {
    name: string;
  }[]
) {
  const existingNames = namedList.map((n) => n.name);
  let name = baseName;
  let i = 1;
  while (existingNames.includes(name)) {
    name = `${baseName} ${i}`;
    i++;
  }
  return name;
}
