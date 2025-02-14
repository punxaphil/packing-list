import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  DocumentData,
  QueryDocumentSnapshot,
  QuerySnapshot,
  WithFieldValue,
  WriteBatch,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { Image } from '../types/Image.ts';
import { MemberPackItem } from '../types/MemberPackItem.ts';
import { NamedEntity } from '../types/NamedEntity.ts';
import { PackItem } from '../types/PackItem.ts';

const firebaseConfig = {
  // This is the public key (used client side in browser), so it's safe to be here
  apiKey: 'AIzaSyBB37kGiEQ2NBhHf9voJ6ugGRkUIyaOYAE',
  authDomain: 'packing-list-448814.firebaseapp.com',
  projectId: 'packing-list-448814',
  storageBucket: 'packing-list-448814.firebasestorage.app',
  messagingSenderId: '831855277007',
  appId: '1:831855277007:web:a09c7bd0ed58b51ea8d8ba',
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const CATEGORIES_KEY = 'categories';
const MEMBERS_KEY = 'members';
const PACK_ITEMS_KEY = 'packItems';
const USERS_KEY = 'users';
const IMAGES_KEY = 'images';

export const firebase = {
  getUserCollectionsAndSubscribe: async (
    setMembers: (members: NamedEntity[]) => void,
    setCategories: (categories: NamedEntity[]) => void,
    setPackItems: (packItems: PackItem[]) => void,
    setImages: (images: Image[]) => void
  ) => {
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
  },

  addPackItem: async (name: string, members: MemberPackItem[], category: string): Promise<PackItem> => {
    const docRef = await add(PACK_ITEMS_KEY, { name, members, category });
    return { id: docRef.id, checked: false, members, name, category };
  },
  updatePackItem: async (packItem: PackItem) => {
    await update(PACK_ITEMS_KEY, packItem.id, packItem);
  },
  deletePackItem: async (id: string) => {
    await del(PACK_ITEMS_KEY, id);
  },
  addMember: async (name: string): Promise<string> => {
    const docRef = await add(MEMBERS_KEY, { name });
    return docRef.id;
  },
  updateMembers: async (toUpdate: NamedEntity[] | NamedEntity) => {
    if (Array.isArray(toUpdate)) {
      await updateInBatch(MEMBERS_KEY, toUpdate);
    } else {
      await update(MEMBERS_KEY, toUpdate.id, toUpdate);
    }
  },
  addCategory: async (name: string): Promise<string> => {
    const docRef = await add(CATEGORIES_KEY, { name });
    return docRef.id;
  },
  updateCategories: async (categories: NamedEntity[] | NamedEntity) => {
    if (Array.isArray(categories)) {
      await updateInBatch(CATEGORIES_KEY, categories);
    } else {
      await update(CATEGORIES_KEY, categories.id, categories);
    }
  },
  addImage: async (type: string, typeId: string, url: string): Promise<void> => {
    await add(IMAGES_KEY, { type, typeId, url });
  },
  async updateImage(imageId: string, fileUrl: string) {
    await update(IMAGES_KEY, imageId, { url: fileUrl });
  },
  async deleteImage(imageId: string) {
    await del(IMAGES_KEY, imageId);
  },
  initBatch: () => {
    return writeBatch(firestore);
  },
  deletePackItemBatch(id: string, writeBatch: WriteBatch) {
    writeBatch.delete(doc(firestore, USERS_KEY, getUserId(), PACK_ITEMS_KEY, id));
  },
  addCategoryBatch(category: string, writeBatch: WriteBatch) {
    return addBatch(CATEGORIES_KEY, writeBatch, { name: category });
  },
  addMemberBatch(member: string, writeBatch: WriteBatch) {
    return addBatch(MEMBERS_KEY, writeBatch, { name: member });
  },
  updatePackItemBatch<K extends DocumentData>(data: WithFieldValue<K>, writeBatch: WriteBatch) {
    writeBatch.update(doc(firestore, USERS_KEY, getUserId(), PACK_ITEMS_KEY, data.id), data);
  },
  addPackItemBatch(writeBatch: WriteBatch, name: string, members: MemberPackItem[], category: string): PackItem {
    const id = addBatch(PACK_ITEMS_KEY, writeBatch, {
      name,
      members: members,
      category: category,
    });
    return { id, checked: false, members, name, category };
  },
  updateCategoryBatch<K extends DocumentData>(id: string, data: WithFieldValue<K>, batch: WriteBatch) {
    batch.update(doc(firestore, USERS_KEY, getUserId(), CATEGORIES_KEY, id), data);
  },
  deleteCategoryBatch(id: string, batch: WriteBatch) {
    batch.delete(doc(firestore, USERS_KEY, getUserId(), CATEGORIES_KEY, id));
  },
  deleteMemberBatch(id: string, batch: WriteBatch) {
    batch.delete(doc(firestore, USERS_KEY, getUserId(), MEMBERS_KEY, id));
  },
};

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
  }
  throw new Error('Unable to add to database');
}

async function updateInBatch<K extends DocumentData>(userColl: string, data: WithFieldValue<K>[]) {
  const batch = writeBatch(firestore);
  const coll = collection(firestore, USERS_KEY, getUserId(), userColl);
  for (const d of data) {
    batch.update(doc(coll, d.id), d);
  }
  await batch.commit();
}

async function update<K extends DocumentData>(userColl: string, id: string, data: WithFieldValue<K>) {
  const coll = collection(firestore, USERS_KEY, getUserId(), userColl);
  await updateDoc(doc(coll, id), data);
}

async function del(userColl: string, id: string) {
  await deleteDoc(doc(firestore, USERS_KEY, getUserId(), userColl, id));
}

function addBatch<K extends DocumentData>(userColl: string, writeBatch: WriteBatch, data: WithFieldValue<K>) {
  const docRef = doc(collection(firestore, USERS_KEY, getUserId(), userColl));
  writeBatch.set(docRef, data);
  return docRef.id;
}
