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
import { NamedEntity } from '../types/NamedEntity.ts';
import { PackItem } from '../types/PackItem.ts';
import { getAuth } from 'firebase/auth';
import { MemberPackItem } from '../types/MemberPackItem.ts';
import { Image } from '../types/Image.ts';

const MEMBERS_KEY = 'members';
const PACK_ITEMS_KEY = 'packItems';
const USERS_KEY = 'users';
const IMAGES_KEY = 'images';

const CATEGORIES_KEY = 'categories';

export async function getUserCollectionsAndSubscribe(
  setMembers: (members: NamedEntity[]) => void,
  setCategories: (categories: NamedEntity[]) => void,
  setPackItems: (packItems: PackItem[]) => void,
  setImages: (images: Image[]) => void
) {
  const userId = getUserId();
  const memberQuery = collection(firestore, USERS_KEY, userId, MEMBERS_KEY);
  const itemsQuery = collection(firestore, USERS_KEY, userId, PACK_ITEMS_KEY);
  const categoriesQuery = collection(firestore, USERS_KEY, userId, CATEGORIES_KEY);
  const imagesQuery = collection(firestore, USERS_KEY, userId, IMAGES_KEY);

  await getInitialData();
  createSubscriptions();

  async function getInitialData() {
    const members: NamedEntity[] = fromQueryResult(await getDocs(memberQuery));
    const categories: NamedEntity[] = fromQueryResult(await getDocs(categoriesQuery));
    const packItems: PackItem[] = fromQueryResult(await getDocs(itemsQuery));
    setMembers(members);
    setCategories(categories);
    setPackItems(packItems);
    setImages(fromQueryResult(await getDocs(imagesQuery)));
  }

  function createSubscriptions() {
    onSnapshot(memberQuery, (res) => setMembers(fromQueryResult(res)));
    onSnapshot(categoriesQuery, (res) => setCategories(fromQueryResult(res)));
    onSnapshot(itemsQuery, (res) => setPackItems(fromQueryResult(res)));
    onSnapshot(imagesQuery, (res) => setImages(fromQueryResult(res)));
  }
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
  addPackItem: async function (
    name: string,
    members: MemberPackItem[],
    category: string
  ): Promise<PackItem | undefined> {
    const docRef = await add(PACK_ITEMS_KEY, { name, members, category });
    if (docRef) {
      return { id: docRef.id, checked: false, members, name, category };
    } else {
      throw new Error('Unable to add item');
    }
  },
  updatePackItem: async function (packItem: PackItem) {
    await update(PACK_ITEMS_KEY, packItem.id, packItem);
  },
  deleteItem: async function (id: string) {
    await del(PACK_ITEMS_KEY, id);
  },
  addMember: async function (name: string): Promise<void> {
    await add(MEMBERS_KEY, { name });
  },
  updateMember: async function (member: NamedEntity) {
    await update(MEMBERS_KEY, member.id, member);
  },
  deleteMember: async function (id: string) {
    await del(MEMBERS_KEY, id);
  },
  addCategory: async function (name: string): Promise<void> {
    await add(CATEGORIES_KEY, { name });
  },
  updateCategory: async function (category: NamedEntity) {
    await update(CATEGORIES_KEY, category.id, category);
  },
  deleteCategory: async function (id: string) {
    await del(CATEGORIES_KEY, id);
  },
  addImage: async function (type: string, typeId: string, url: string): Promise<void> {
    await add(IMAGES_KEY, { type, typeId, url });
  },
  async updateImage(imageId: string, fileUrl: string) {
    await update(IMAGES_KEY, imageId, { url: fileUrl });
  },
  async deleteImage(imageId: string) {
    await del(IMAGES_KEY, imageId);
  },
};
