import { WriteBatch } from 'firebase/firestore';
import { GroupedPackItem } from '~/types/GroupedPackItem.ts';
import { MemberPackItem } from '~/types/MemberPackItem.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem, TextPackItem } from '~/types/PackItem.ts';

import { Database } from '~/services/database.ts';
import { UNCATEGORIZED, getMemberName, rankOnTop } from './utils.ts';

export function getGroupedAsText(grouped: GroupedPackItem[], members: NamedEntity[]) {
  let result = '';
  for (const group of grouped) {
    if (group.category.id) {
      result += `${group.category.name}\n`;
    }

    for (const item of group.packItems) {
      result += `- ${item.name}\n`;
      for (const m of item.members) {
        result += `-- ${getMemberName(members, m.id)}\n`;
      }
    }
  }
  return result;
}

export function createTextPackItemsFromText(groupedAsText: string): TextPackItem[] {
  const items: TextPackItem[] = [];
  let currentItem: TextPackItem | undefined = undefined;
  let currentCategory = '';
  for (const line of groupedAsText.split('\n')) {
    if (/^ *--.*/.test(line)) {
      const memberName = line.trim().replace('--', '').trim();
      if (currentItem) {
        currentItem.members.push(memberName);
      }
    } else if (/^ *-.*/.test(line)) {
      const itemName = line.trim().replace('-', '').trim();
      currentItem = { name: itemName, members: [], category: currentCategory };
      items.push(currentItem);
    } else {
      currentCategory = line.trim();
    }
  }
  return items;
}

export async function updateDatabaseFromTextPackItems(
  packItems: PackItem[],
  textPackItems: TextPackItem[],
  members: NamedEntity[],
  categories: NamedEntity[],
  packingListId: string,
  dbInvoke: Database
) {
  const writeBatch = dbInvoke.initBatch();
  deleteRemovedPackItems(textPackItems, packItems, writeBatch, dbInvoke);
  let rank = textPackItems.length;
  for (const t of textPackItems) {
    const packItem = packItems.find((pi) => pi.name === t.name);
    if (packItem) {
      updateExistingPackItem(t, members, packItem, categories, writeBatch, rank, dbInvoke);
    } else {
      addNewPackItem(t, members, categories, writeBatch, packingListId, rank, dbInvoke);
    }
    rank--;
  }
  await writeBatch.commit();
}

function deleteRemovedPackItems(
  textPackItems: TextPackItem[],
  packItems: PackItem[],
  writeBatch: WriteBatch,
  dbInvoke: Database
) {
  const existingPackItemNames = textPackItems.map((t) => t.name);
  for (const packItem of packItems) {
    if (!existingPackItemNames.includes(packItem.name)) {
      dbInvoke.deletePackItemBatch(packItem.id, writeBatch);
    }
  }
}

function updateExistingPackItem(
  t: TextPackItem,
  members: NamedEntity[],
  packItem: PackItem,
  categories: NamedEntity[],
  writeBatch: WriteBatch,
  rank: number,
  dbInvoke: Database
) {
  const memberPackItems = getMemberPackItems(t, members, packItem, writeBatch, dbInvoke);
  const category = addCategoryIfNew(categories, t, writeBatch, dbInvoke);
  updatePackItemIfChanged(packItem, category, memberPackItems, rank, writeBatch, dbInvoke);
}

function getMemberPackItems(
  t: TextPackItem,
  members: NamedEntity[],
  packItem: PackItem,
  writeBatch: WriteBatch,
  dbInvoke: Database
) {
  let memberPackItems: MemberPackItem[] = [];
  if (t.members) {
    memberPackItems = [];
    for (const textPackItemMember of t.members) {
      const member = members.find((member) => member.name === textPackItemMember);
      const checked = packItem.members.find((mpi) => mpi.id === member?.id)?.checked ?? false;
      const id = addMemberIfNew(textPackItemMember, members, member, writeBatch, dbInvoke);
      memberPackItems.push({ id, checked });
    }
  }
  return memberPackItems;
}

function addMemberIfNew(
  textPackItemMember: string,
  members: NamedEntity[],
  member: NamedEntity | undefined,
  writeBatch: WriteBatch,
  dbInvoke: Database
) {
  let id: string;
  if (member) {
    id = member.id;
  } else {
    id = dbInvoke.addMemberBatch(textPackItemMember, writeBatch);
    members.push({ id, name: textPackItemMember, rank: members.length });
  }
  return id;
}

function addCategoryIfNew(categories: NamedEntity[], t: TextPackItem, writeBatch: WriteBatch, dbInvoke: Database) {
  if (!t.category) {
    return UNCATEGORIZED;
  }
  let category = categories.find((cat) => cat.name === t.category);
  if (!category) {
    const id = dbInvoke.addCategoryBatch(t.category, writeBatch);
    category = { id, name: t.category, rank: rankOnTop(categories) };
    categories.push(category);
  }
  return category;
}

function updatePackItemIfChanged(
  packItem: PackItem,
  category: NamedEntity,
  memberPackItems: MemberPackItem[],
  rank: number,
  writeBatch: WriteBatch,
  dbInvoke: Database
) {
  const memberPackItemsChanged = JSON.stringify(memberPackItems) !== JSON.stringify(packItem.members);
  if (category.id !== packItem.category || memberPackItemsChanged || rank !== packItem.rank) {
    const updated = { ...packItem };
    updated.category = category.id;
    updated.members = memberPackItems;
    updated.rank = rank;
    dbInvoke.updatePackItemBatch(updated, writeBatch);
  }
}

function addNewPackItem(
  t: TextPackItem,
  members: NamedEntity[],
  categories: NamedEntity[],
  writeBatch: WriteBatch,
  packingListId: string,
  rank: number,
  dbInvoke: Database
) {
  const memberPackItems = [];
  if (t.members) {
    for (const textPackItemMember of t.members) {
      const member = members.find((member) => member.name === textPackItemMember);
      const id = addMemberIfNew(textPackItemMember, members, member, writeBatch, dbInvoke);
      memberPackItems.push({ id, checked: false });
    }
  }
  let category: NamedEntity | undefined;
  if (t.category) {
    category = categories.find((cat) => cat.name === t.category);
    if (!category) {
      const newId = dbInvoke.addCategoryBatch(t.category, writeBatch);
      category = { id: newId, name: t.category, rank: rankOnTop(categories) };
      categories.push(category);
    }
  }
  dbInvoke.addPackItemBatch(writeBatch, t.name, memberPackItems, category?.id ?? '', rank, packingListId);
}
