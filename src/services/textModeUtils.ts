import { PackItem, TextPackItem } from '../types/PackItem.ts';
import { NamedEntity } from '../types/NamedEntity.ts';
import { firebase } from './api.ts';
import { MemberPackItem } from '../types/MemberPackItem.ts';

export function getGroupedAsText(
  grouped: Record<string, PackItem[]>,
  categories: NamedEntity[],
  members: NamedEntity[]
) {
  let result = '';
  for (const [category, items] of Object.entries(grouped)) {
    const categoryName = categories.find((c) => c.id === category)?.name;
    if (categoryName) {
      result += categoryName + '\n';
    }

    for (const item of items) {
      result += '- ' + item.name + '\n';
      if (item.members) {
        for (const m of item.members) {
          result += '-- ' + members.find((t) => t.id === m.id)?.name + '\n';
        }
      }
    }
  }
  return result;
}

export function createTextPackItemsFromText(groupedAsText: string): TextPackItem[] {
  const items: TextPackItem[] = [];
  let currentItem: TextPackItem | undefined = undefined;
  let currentCategory: string = '';
  groupedAsText.split('\n').forEach((line) => {
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
      const newPI = await addNewPackItem(t, members, categories);
      packItems.push(newPI);
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
  const memberPackItems = await getMemberPackItems(t, members, packItem);
  const category = await addCategoryIfNew(categories, t);
  await updatePackItemIfChanged(packItem, category, memberPackItems);
}

async function getMemberPackItems(t: TextPackItem, members: NamedEntity[], packItem: PackItem) {
  let memberPackItems: MemberPackItem[] | undefined;
  if (t.members) {
    memberPackItems = [];
    for (const tpim of t.members) {
      const member = members.find((member) => member.name === tpim);
      const checked = packItem.members?.find((mpi) => mpi.id === member?.id)?.checked ?? false;
      const id = await addMemberIfNew(tpim, members, member);
      memberPackItems.push({ id, checked });
    }
  }
  return memberPackItems;
}

async function addMemberIfNew(textPackItemMember: string, members: NamedEntity[], member?: NamedEntity) {
  let id: string;
  if (member) {
    id = member.id;
  } else {
    id = await firebase.addMember(textPackItemMember);
    members.push({ id, name: textPackItemMember });
  }
  return id;
}

async function addCategoryIfNew(categories: NamedEntity[], t: TextPackItem) {
  let category = categories.find((cat) => cat.name === t.category);
  if (!category && t.category) {
    const id = await firebase.addCategory(t.category);
    category = { id, name: t.category };
    categories.push(category);
  }
  return category;
}

async function updatePackItemIfChanged(
  packItem: PackItem,
  category: NamedEntity | undefined,
  memberPackItems?: MemberPackItem[]
) {
  const memberPackItemsChanged = JSON.stringify(memberPackItems) !== JSON.stringify(packItem.members);
  if (category?.id !== packItem.category || memberPackItemsChanged) {
    packItem.category = category?.id ?? '';
    packItem.members = memberPackItems;
    await firebase.updatePackItem(packItem);
  }
}

async function addNewPackItem(t: TextPackItem, members: NamedEntity[], categories: NamedEntity[]) {
  const memberPackItems = [];
  if (t.members) {
    for (const tpim of t.members) {
      const member = members.find((member) => member.name === tpim);
      const id = await addMemberIfNew(tpim, members, member);
      memberPackItems.push({ id, checked: false });
    }
  }
  let category;
  if (t.category) {
    // find or create category
    category = categories.find((cat) => cat.name === t.category);
    if (!category) {
      const newId = await firebase.addCategory(t.category);
      category = { id: newId, name: t.category };
      categories.push(category);
    }
  }
  return await firebase.addPackItem(t.name, memberPackItems, category?.id ?? '');
}
