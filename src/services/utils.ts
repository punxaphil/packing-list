import { KeyboardEvent } from 'react';
import { GroupedPackItem } from '../types/GroupedPackItem.ts';
import { Image } from '../types/Image.ts';
import { MemberPackItem } from '../types/MemberPackItem.ts';
import { NamedEntity } from '../types/NamedEntity.ts';
import { PackItem } from '../types/PackItem.ts';

export function getMemberName(members: NamedEntity[], memberId?: string) {
  return members.find((t) => t.id === memberId)?.name;
}

export function allChecked(packItem: PackItem) {
  return packItem.members.every((t) => t.checked);
}

export function allUnChecked(packItem: PackItem) {
  return packItem.members.every((t) => !t.checked);
}

function getCategoryRank(catId: string, categories: NamedEntity[]) {
  const category = categories.find((c) => c.id === (catId ?? ''));
  return category?.rank ?? -1;
}

export function groupByCategories(packItems: PackItem[], categories: NamedEntity[]) {
  packItems.sort((a, b) => sortByRank(a, b));
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

function sortByRank(a?: NamedEntity, b?: NamedEntity) {
  return (b?.rank ?? 0) - (a?.rank ?? 0);
}

export function sortEntities(entities: NamedEntity[]) {
  entities.sort(sortByRank);
}

export function sortPackItems(packItems: PackItem[], members: NamedEntity[], categories: NamedEntity[]) {
  for (const packItem of packItems) {
    sortPackItemMembersAccordingToMemberRank(members, packItem.members);
  }
  sortPackItemsBasedOnCategoryRank(packItems, categories);

  function sortPackItemMembersAccordingToMemberRank(members: NamedEntity[], itemMembers: MemberPackItem[]) {
    const getMemberFromId = (mi: MemberPackItem) => members.find((m) => m.id === mi.id);
    itemMembers.sort((a, b) => sortByRank(getMemberFromId(a), getMemberFromId(b)));
  }

  function sortPackItemsBasedOnCategoryRank(packItems: PackItem[], categories: NamedEntity[]) {
    const getCategoryFromId = (pi: PackItem) =>
      pi.category ? categories.find((cat) => cat.id === pi.category) : undefined;
    packItems.sort((a, b) => sortByRank(getCategoryFromId(a), getCategoryFromId(b)));
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

export function getProfileImage(images: Image[]) {
  return images.find((image) => image.type === 'profile');
}

export function getCategoryName(categories: NamedEntity[], categoryId: string) {
  return categories.find((c) => c.id === categoryId)?.name;
}
