import { PackItem, TextPackItem } from '../types/PackItem.ts';
import { NamedEntity } from '../types/NamedEntity.ts';
import { firebase } from './api.ts';

export function createTextPackItemsFromText(groupedAsText: string): TextPackItem[] {
  const items: TextPackItem[] = [];
  let currentItem: TextPackItem | undefined = undefined;
  let currentCategory: string | undefined = undefined;
  groupedAsText.split('\n').forEach((line) => {
    if (/^ {4}[^ ].*/.test(line)) {
      const memberName = line.trim();
      if (currentItem) {
        currentItem.members.push(memberName);
      }
    } else if (/^ {2}[^ ].*/.test(line)) {
      const itemName = line.trim();
      currentItem = { name: itemName, members: [], category: currentCategory };
      items.push(currentItem);
    } else if (/^[^ ].*/.test(line)) {
      currentCategory = line.trim();
    }
  });
  return items;
}

export async function updateFirebaseFromTextPackItems(
  packItems: PackItem[],
  textPackItems: TextPackItem[],
  members: NamedEntity[],
  categories: NamedEntity[]
) {
  await deleteRemovedPackItems(textPackItems, packItems);
  for (const t of textPackItems) {
    const packItem = packItems.find((pi) => pi.name === t.name);
    if (packItem) {
      await updateExistingPackItem(t, members, packItem, categories);
    } else {
      await addNewPackItem(t, members, categories);
    }
  }
}

async function deleteRemovedPackItems(textPackItems: TextPackItem[], packItems: PackItem[]) {
  const existingPackItemNames = textPackItems.map((t) => t.name);
  for (const packItem of packItems) {
    if (!existingPackItemNames.includes(packItem.name)) {
      await firebase.deletePackItem(packItem.id);
    }
  }
}

async function updateExistingPackItem(
  t: TextPackItem,
  members: NamedEntity[],
  packItem: PackItem,
  categories: NamedEntity[]
) {
  const memberPackItems = [];
  for (const m of t.members) {
    const member = members.find((member) => member.name === m);
    const id = member ? member.id : await firebase.addMember(m);
    const checked = packItem.members?.find((mpi) => mpi.id === member?.id)?.checked ?? false;
    memberPackItems.push({ id, checked });
  }
  // update if category has changed
  let category = categories.find((cat) => cat.name === t.category);
  if (!category && t.category) {
    const id = await firebase.addCategory(t.category);
    category = { id, name: t.category };
  }
  const memberPackItemsChanged = JSON.stringify(memberPackItems) !== JSON.stringify(packItem.members);
  if (category?.id !== packItem.category || memberPackItemsChanged) {
    await firebase.updatePackItem({ ...packItem, members: memberPackItems, category: category?.id ?? '' });
  }
}

async function addNewPackItem(t: TextPackItem, members: NamedEntity[], categories: NamedEntity[]) {
  const memberPackItems = [];
  for (const m of t.members) {
    const member = members.find((member) => member.name === m);
    const id = member ? member.id : await firebase.addMember(m);
    memberPackItems.push({ id, checked: false });
  }
  let category;
  if (t.category) {
    // find or create category
    category = categories.find((cat) => cat.name === t.category);
    if (!category) {
      const newId = await firebase.addCategory(t.category);
      category = { id: newId, name: t.category };
    }
  }
  await firebase.addPackItem(t.name, memberPackItems, category?.id ?? '');
}
