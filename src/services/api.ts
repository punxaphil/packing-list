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
  writeBatch,
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
  const docRef = await addDoc(coll, data);
  if (docRef) {
    return docRef;
  } else {
    throw new Error('Unable to add to database');
  }
}

async function updateInBatch<K extends DocumentData>(userColl: string, data: WithFieldValue<K>[]) {
  const batch = writeBatch(firestore);
  const coll = collection(firestore, USERS_KEY, getUserId(), userColl);
  data.forEach((d) => {
    batch.update(doc(coll, d.id), d);
  });
  await batch.commit();
}

async function update<K extends DocumentData>(userColl: string, id: string, data: WithFieldValue<K>) {
  const coll = collection(firestore, USERS_KEY, getUserId(), userColl);
  await updateDoc(doc(coll, id), data);
}

async function del(userColl: string, id: string) {
  await deleteDoc(doc(firestore, USERS_KEY, getUserId(), userColl, id));
}

export const firebase = {
  addPackItem: async function (name: string, members: MemberPackItem[], category: string): Promise<PackItem> {
    const docRef = await add(PACK_ITEMS_KEY, { name, members, category });
    return { id: docRef.id, checked: false, members, name, category };
  },
  updatePackItem: async function (packItem: PackItem) {
    await update(PACK_ITEMS_KEY, packItem.id, packItem);
  },
  deletePackItem: async function (id: string) {
    await del(PACK_ITEMS_KEY, id);
  },
  addMember: async function (name: string): Promise<string> {
    const docRef = await add(MEMBERS_KEY, { name });
    return docRef.id;
  },
  updateMember: async function (member: NamedEntity) {
    await update(MEMBERS_KEY, member.id, member);
  },
  updateMembers: async function (toUpdate: NamedEntity[] | NamedEntity) {
    if (Array.isArray(toUpdate)) {
      await updateInBatch(MEMBERS_KEY, toUpdate);
    } else {
      await update(MEMBERS_KEY, toUpdate.id, toUpdate);
    }
  },
  deleteMember: async function (id: string) {
    await del(MEMBERS_KEY, id);
  },
  addCategory: async function (name: string): Promise<string> {
    const docRef = await add(CATEGORIES_KEY, { name });
    return docRef.id;
  },
  updateCategories: async function (categories: NamedEntity[] | NamedEntity) {
    if (Array.isArray(categories)) {
      await updateInBatch(CATEGORIES_KEY, categories);
    } else {
      await update(CATEGORIES_KEY, categories.id, categories);
    }
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
