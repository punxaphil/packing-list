import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  updateDoc,
  WithFieldValue,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Member } from '../types/Member.ts';
import { Item } from '../types/Item.ts';
import { Category } from '../types/Category.ts';
import { getAuth } from 'firebase/auth';
import { MemberItem } from '../types/MemberItem.ts';

const MEMBERS_KEY = 'members';
const ITEMS_KEY = 'items';
const USERS_KEY = 'users';

const CATEGORIES_KEY = 'categories';

export async function getUserData(
  setMember: (members: Member[]) => void,
  setCategory: (categories: Category[]) => void,
  setItem: (items: Item[]) => void
) {
  const userId = getUserId();
  const memberQuery = collection(firestore, USERS_KEY, userId, MEMBERS_KEY);
  const itemsQuery = collection(firestore, USERS_KEY, userId, ITEMS_KEY);
  const categoriesQuery = collection(firestore, USERS_KEY, userId, CATEGORIES_KEY);
  onSnapshot(memberQuery, (coll) => setMember(coll.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Member[]));
  onSnapshot(itemsQuery, (coll) => setItem(coll.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Item[]));
  onSnapshot(categoriesQuery, (coll) =>
    setCategory(coll.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Category[])
  );

  const members = await getDocs(memberQuery);
  const items = await getDocs(itemsQuery);
  const categories = await getDocs(categoriesQuery);

  return {
    id: userId,
    members: members.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Member[],
    items: items.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Item[],
    categories: categories.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Category[],
  };
}

function getUserId() {
  const userId = getAuth().currentUser?.uid;
  if (!userId) {
    throw new Error('No user logged in');
  }
  return userId;
}

async function add<K extends DocumentData>(userColl: string, data: WithFieldValue<K>) {
  const coll = collection(firestore, USERS_KEY, getUserId(), userColl);
  return await addDoc(coll, data);
}

async function update<K extends DocumentData>(userColl: string, id: string, data: WithFieldValue<K>) {
  const coll = collection(firestore, USERS_KEY, getUserId(), userColl);
  await updateDoc(doc(coll, id), data);
}

async function del(userColl: string, id: string) {
  await deleteDoc(doc(firestore, USERS_KEY, getUserId(), userColl, id));
}

export const firebase = {
  addItem: async function (name: string, members: MemberItem[], category: string): Promise<Item | undefined> {
    const docRef = await add(ITEMS_KEY, { name, members, category });
    if (docRef) {
      return { id: docRef.id, checked: false, members, name, category };
    } else {
      throw new Error('Unable to add item');
    }
  },
  updateItem: async function ({ checked, id, members, name, category }: Item) {
    await update(ITEMS_KEY, id, { checked, members, name, category });
  },
  deleteItem: async function (id: string) {
    await del(ITEMS_KEY, id);
  },
  addMember: async function (name: string): Promise<Member> {
    const docRef = await add(MEMBERS_KEY, { name });
    if (docRef) {
      return { id: docRef.id, name };
    } else {
      throw new Error('Unable to add member');
    }
  },
  updateMember: async function ({ id, name }: Member) {
    await update(MEMBERS_KEY, id, { name });
  },
  deleteMember: async function (id: string) {
    await del(MEMBERS_KEY, id);
  },
  addCategory: async function (name: string): Promise<Category> {
    const docRef = await add(CATEGORIES_KEY, { name });
    if (docRef) {
      return { id: docRef.id, name };
    } else {
      throw new Error('Unable to add category');
    }
  },
  updateCategory: async function ({ id, name }: Category) {
    await update(CATEGORIES_KEY, id, { name });
  },
  deleteCategory: async function (id: string) {
    await del(CATEGORIES_KEY, id);
  },
};
