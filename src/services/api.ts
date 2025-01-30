import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  QueryDocumentSnapshot,
  QuerySnapshot,
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

export async function getUserCollectionsAndSubscribe(
  setMembers: (members: Member[]) => void,
  setCategories: (categories: Category[]) => void,
  setItems: (items: Item[]) => void
) {
  const userId = getUserId();
  const memberQuery = collection(firestore, USERS_KEY, userId, MEMBERS_KEY);
  const itemsQuery = collection(firestore, USERS_KEY, userId, ITEMS_KEY);
  const categoriesQuery = collection(firestore, USERS_KEY, userId, CATEGORIES_KEY);
  onSnapshot(memberQuery, (res) => setMembers(fromQueryResult(res)));
  onSnapshot(itemsQuery, (res) => setItems(fromQueryResult(res)));
  onSnapshot(categoriesQuery, (res) => setCategories(fromQueryResult(res)));

  setMembers(fromQueryResult(await getDocs(memberQuery)));
  setCategories(fromQueryResult(await getDocs(categoriesQuery)));
  setItems(fromQueryResult(await getDocs(itemsQuery)));
}

function getUserId() {
  const userId = getAuth().currentUser?.uid;
  if (!userId) {
    throw new Error('No user logged in');
  }
  return userId;
}

function fromQueryResult<K>(res: QuerySnapshot) {
  return res.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as K[];
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
  updateItem: async function (item: Item) {
    await update(ITEMS_KEY, item.id, item);
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
  updateMember: async function (member: Member) {
    await update(MEMBERS_KEY, member.id, member);
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
  updateCategory: async function (category: Category) {
    await update(CATEGORIES_KEY, category.id, category);
  },
  deleteCategory: async function (id: string) {
    await del(CATEGORIES_KEY, id);
  },
};
