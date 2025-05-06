import { KeyboardEvent } from 'react';
import { GroupedPackItem } from '~/types/GroupedPackItem.ts';
import { Image } from '~/types/Image.ts';
import { MemberPackItem } from '~/types/MemberPackItem.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';

export const UNCATEGORIZED: NamedEntity = { id: '', name: 'Uncategorized', rank: Number.MAX_VALUE, color: 'gray.50' };

export function getMemberName(members: NamedEntity[], memberId?: string) {
  return members.find((t) => t.id === memberId)?.name;
}

export function allChecked(packItem: PackItem) {
  return packItem.members.every((t) => t.checked);
}

export function allUnChecked(packItem: PackItem) {
  return packItem.members.every((t) => !t.checked);
}

export function groupByCategories(packItems: PackItem[], categories: NamedEntity[]) {
  const result: GroupedPackItem[] = [];
  for (const packItem of packItems) {
    const find = result.find((r) => r.category.id === packItem.category);
    if (!find) {
      const category = categories.find((c) => c.id === packItem.category) || UNCATEGORIZED;
      result.push({
        category: category,
        packItems: [packItem],
      });
    } else {
      find.packItems.push(packItem);
    }
  }
  return result.sort((a, b) => sortByRank(a.category, b.category));
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
  if (!a && b) {
    return -1;
  }
  if (!b) {
    return 1;
  }
  return (b?.rank ?? 0) - (a?.rank ?? 0);
}

export function sortEntities(entities: NamedEntity[]) {
  entities.sort(sortByRank);
}

export function sortPackItems(packItems: PackItem[], members: NamedEntity[], categories: NamedEntity[]) {
  for (const packItem of packItems) {
    sortPackItemMembersAccordingToMemberRank(packItem.members);
  }
  sortPackItemsBasedOnCategoryRank();
  function sortPackItemMembersAccordingToMemberRank(itemMembers: MemberPackItem[]) {
    const getMemberFromId = (mi: MemberPackItem) => members.find((m) => m.id === mi.id);
    itemMembers.sort((a, b) => sortByRank(getMemberFromId(a), getMemberFromId(b)));
  }

  function sortPackItemsBasedOnCategoryRank() {
    const getCategoryFromId = (pi: PackItem) => categories.find((cat) => cat.id === pi.category) ?? UNCATEGORIZED;

    packItems.sort((a, b) => {
      const categoryA = getCategoryFromId(a);
      const categoryB = getCategoryFromId(b);

      if (categoryA.rank !== categoryB.rank) {
        return categoryB.rank - categoryA.rank;
      }

      if (a.checked !== b.checked) {
        return a.checked ? 1 : -1;
      }

      return b.rank - a.rank;
    });
  }
}

export function handleEnter(e: KeyboardEvent<HTMLInputElement>, onEnter: () => void) {
  if (e.key === 'Enter') {
    onEnter();
  }
}

export function findUniqueName(baseName: string, packingLists: NamedEntity[]) {
  const existingNames = packingLists.map((n) => n.name);
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

export function rankOnTop(entities: NamedEntity[]) {
  return Math.max(...entities.map((entity) => entity.rank).filter((rank) => Number.isInteger(rank)), 0) + 1;
}

export function getPackItemGroup(grouped: GroupedPackItem[], category: NamedEntity) {
  const find = grouped.find((t) => t.category.id === category.id);
  if (!find) {
    throw new Error(`Category ${category.name} not found in grouped pack items`);
  }
  return find;
}

export function reorderArray<T>(list: readonly T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
