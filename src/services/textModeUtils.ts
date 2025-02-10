import { WriteBatch } from 'firebase/firestore';
import { MemberPackItem } from '../types/MemberPackItem.ts';
import { NamedEntity } from '../types/NamedEntity.ts';
import { PackItem, TextPackItem } from '../types/PackItem.ts';
import { firebase } from './api.ts';

export function getGroupedAsText(
  grouped: Record<string, PackItem[]>,
  categories: NamedEntity[],
  members: NamedEntity[]
) {
  let result = '';
  for (const [category, items] of Object.entries(grouped)) {
    const categoryName = categories.find((c) => c.id === category)?.name;
    if (categoryName) {
      result += `${categoryName}\n`;
    }

    for (const item of items) {
      result += `- ${item.name}\n`;
      if (item.members) {
        for (const m of item.members) {
          result += `-- ${members.find((t) => t.id === m.id)?.name}\n`;
        }
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

export async function updateFirebaseFromTextPackItems(
  packItems: PackItem[],
  textPackItems: TextPackItem[],
  members: NamedEntity[],
  categories: NamedEntity[]
) {
  const writeBatch = firebase.initBatch();
  deleteRemovedPackItems(textPackItems, packItems, writeBatch);
  for (const t of textPackItems) {
    const packItem = packItems.find((pi) => pi.name === t.name);
    if (packItem) {
      updateExistingPackItem(t, members, packItem, categories, writeBatch);
    } else {
      const newPackItem = addNewPackItem(t, members, categories, writeBatch);
      packItems.push(newPackItem);
    }
  }
  await writeBatch.commit();
}

function deleteRemovedPackItems(textPackItems: TextPackItem[], packItems: PackItem[], writeBatch: WriteBatch) {
  const existingPackItemNames = textPackItems.map((t) => t.name);
  for (const packItem of packItems) {
    if (!existingPackItemNames.includes(packItem.name)) {
      firebase.deletePackItemBatch(packItem.id, writeBatch);
    }
  }
}

function updateExistingPackItem(
  t: TextPackItem,
  members: NamedEntity[],
  packItem: PackItem,
  categories: NamedEntity[],
  writeBatch: WriteBatch
) {
  const memberPackItems = getMemberPackItems(t, members, packItem, writeBatch);
  const category = addCategoryIfNew(categories, t, writeBatch);
  updatePackItemIfChanged(packItem, category, memberPackItems, writeBatch);
}

function getMemberPackItems(t: TextPackItem, members: NamedEntity[], packItem: PackItem, writeBatch: WriteBatch) {
  let memberPackItems: MemberPackItem[] | undefined;
  if (t.members) {
    memberPackItems = [];
    for (const textPackItemMember of t.members) {
      const member = members.find((member) => member.name === textPackItemMember);
      const checked = packItem.members?.find((mpi) => mpi.id === member?.id)?.checked ?? false;
      const id = addMemberIfNew(textPackItemMember, members, member, writeBatch);
      memberPackItems.push({ id, checked });
    }
  }
  return memberPackItems;
}

function addMemberIfNew(
  textPackItemMember: string,
  members: NamedEntity[],
  member: NamedEntity | undefined,
  writeBatch: WriteBatch
) {
  let id: string;
  if (member) {
    id = member.id;
  } else {
    id = firebase.addMemberBatch(textPackItemMember, writeBatch);
    members.push({ id, name: textPackItemMember });
  }
  return id;
}

function addCategoryIfNew(categories: NamedEntity[], t: TextPackItem, writeBatch: WriteBatch) {
  let category = categories.find((cat) => cat.name === t.category);
  if (!category && t.category) {
    const id = firebase.addCategoryBatch(t.category, writeBatch);
    category = { id, name: t.category };
    categories.push(category);
  }
  return category;
}

function updatePackItemIfChanged(
  packItem: PackItem,
  category: NamedEntity | undefined,
  memberPackItems: MemberPackItem[] | undefined,
  writeBatch: WriteBatch
) {
  const memberPackItemsChanged = JSON.stringify(memberPackItems) !== JSON.stringify(packItem.members);
  if (category?.id !== packItem.category || memberPackItemsChanged) {
    packItem.category = category?.id ?? '';
    packItem.members = memberPackItems;
    firebase.updatePackItemBatch(packItem, writeBatch);
  }
}

function addNewPackItem(t: TextPackItem, members: NamedEntity[], categories: NamedEntity[], writeBatch: WriteBatch) {
  const memberPackItems = [];
  if (t.members) {
    for (const textPackItemMember of t.members) {
      const member = members.find((member) => member.name === textPackItemMember);
      const id = addMemberIfNew(textPackItemMember, members, member, writeBatch);
      memberPackItems.push({ id, checked: false });
    }
  }
  let category: NamedEntity | undefined;
  if (t.category) {
    // find or create category
    category = categories.find((cat) => cat.name === t.category);
    if (!category) {
      const newId = firebase.addCategoryBatch(t.category, writeBatch);
      category = { id: newId, name: t.category };
      categories.push(category);
    }
  }
  return firebase.addPackItemBatch(writeBatch, t.name, memberPackItems, category?.id ?? '');
}
