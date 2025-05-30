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
  getDoc,
  getDocs,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { ArrayError } from '~/types/ArrayError.ts';
import { Image } from '~/types/Image.ts';
import { MemberPackItem } from '~/types/MemberPackItem.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import { sortEntities } from './utils.ts';

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
const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

const CATEGORIES_KEY = 'categories';
const MEMBERS_KEY = 'members';
const PACK_ITEMS_KEY = 'packItems';
const USERS_KEY = 'users';
const IMAGES_KEY = 'images';
const PACKING_LISTS_KEY = 'packingLists';

const subs: (() => void)[] = [];

function unsubscribeAll() {
  for (const unsubscribe of subs) {
    unsubscribe();
  }
  subs.length = 0;
}

export const readDb = {
  getUserCollectionsAndSubscribe: async (
    setMembers: (members: NamedEntity[]) => void,
    setCategories: (categories: NamedEntity[]) => void,
    setPackItems: (packItems: PackItem[]) => void,
    setImages: (images: Image[]) => void,
    setPackingLists: (packingLists: NamedEntity[]) => void,
    packingListId: string
  ) => {
    const userId = getUserId();
    const memberQuery = collection(firestore, USERS_KEY, userId, MEMBERS_KEY);
    const itemsQuery = query(
      collection(firestore, USERS_KEY, userId, PACK_ITEMS_KEY),
      where('packingList', '==', packingListId)
    );
    const categoriesQuery = collection(firestore, USERS_KEY, userId, CATEGORIES_KEY);
    const imagesQuery = collection(firestore, USERS_KEY, userId, IMAGES_KEY);
    const packingListsQuery = collection(firestore, USERS_KEY, userId, PACKING_LISTS_KEY);

    await getInitialData();
    createSubscriptions();

    async function getInitialData() {
      setMembers(fromQueryResult(await getDocs(memberQuery)));
      setCategories(fromQueryResult(await getDocs(categoriesQuery)));
      setPackItems(fromQueryResult(await getDocs(itemsQuery)));
      setImages(fromQueryResult(await getDocs(imagesQuery)));
      setPackingLists(fromQueryResult(await getDocs(packingListsQuery)));
    }

    function createSubscriptions() {
      unsubscribeAll();
      subs.push(onSnapshot(memberQuery, (res) => setMembers(fromQueryResult(res))));
      subs.push(onSnapshot(categoriesQuery, (res) => setCategories(fromQueryResult(res))));
      subs.push(onSnapshot(itemsQuery, (res) => setPackItems(fromQueryResult<PackItem>(res))));
      subs.push(onSnapshot(imagesQuery, (res) => setImages(fromQueryResult(res))));
      subs.push(onSnapshot(packingListsQuery, (res) => setPackingLists(fromQueryResult(res))));
    }
  },
};
export const writeDb = {
  addPackItem: async (
    name: string,
    members: MemberPackItem[],
    category: string,
    packingList: string,
    rank: number
  ): Promise<PackItem> => {
    const docRef = await add(PACK_ITEMS_KEY, { name, members, checked: false, category, packingList, rank });
    return { id: docRef.id, checked: false, members, name, category, packingList, rank };
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
    await updateNamedEntities(MEMBERS_KEY, toUpdate);
  },
  addCategory: async (name: string): Promise<string> => {
    const docRef = await add(CATEGORIES_KEY, { name });
    return docRef.id;
  },
  updateCategories: async (categories: NamedEntity[] | NamedEntity) => {
    await updateNamedEntities(CATEGORIES_KEY, categories);
  },
  updatePackingLists: async (packingLists: NamedEntity[] | NamedEntity) => {
    await updateNamedEntities(PACKING_LISTS_KEY, packingLists);
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
  addPackItemBatch(
    writeBatch: WriteBatch,
    name: string,
    members: MemberPackItem[],
    category: string,
    rank: number,
    packingList: string,
    checked = false
  ) {
    return addBatch(PACK_ITEMS_KEY, writeBatch, {
      name,
      members,
      checked,
      category,
      packingList,
      rank,
    });
  },
  async deleteCategory(id: string, packingLists: NamedEntity[], deleteEvenIfUsed = false) {
    const packItemsQuery = query(
      collection(firestore, USERS_KEY, getUserId(), PACK_ITEMS_KEY),
      where('category', '==', id)
    );
    const packItems: PackItem[] = fromQueryResult(await getDocs(packItemsQuery));
    if (packItems.length) {
      if (!deleteEvenIfUsed) {
        throwNamedEntityArrayError('Category', packItems, packingLists);
      }
      const batch = writeBatch(firestore);
      for (const packItem of packItems) {
        packItem.category = '';
        writeDb.updatePackItemBatch(packItem, batch);
      }
      await batch.commit();
    }
    await del(CATEGORIES_KEY, id);
  },
  async deleteMember(id: string, packingLists: NamedEntity[], deleteEvenIfUsed = false) {
    const packItemsQuery = query(
      collection(firestore, USERS_KEY, getUserId(), PACK_ITEMS_KEY),
      where('members', '!=', [])
    );
    let packItems: PackItem[] = fromQueryResult(await getDocs(packItemsQuery));
    packItems = packItems.filter((t) => t.members.find((m) => m.id === id));

    if (packItems.length) {
      if (!deleteEvenIfUsed) {
        throwNamedEntityArrayError('Member', packItems, packingLists);
      }
      const batch = writeBatch(firestore);
      for (const packItem of packItems) {
        packItem.members = packItem.members.filter((m) => m.id !== id);
        writeDb.updatePackItemBatch(packItem, batch);
      }
      await batch.commit();
    }
    await del(MEMBERS_KEY, id);
  },
  async getFirstPackingList(): Promise<NamedEntity | undefined> {
    const userId = getUserId();
    const query = collection(firestore, USERS_KEY, userId, PACKING_LISTS_KEY);
    const packingLists = fromQueryResult(await getDocs(query)) as NamedEntity[];
    return packingLists.length ? packingLists[0] : undefined;
  },
  async addPackingList(name: string, rank: number) {
    const docRef = await add(PACKING_LISTS_KEY, { name: name, rank });
    return docRef.id;
  },
  async getPackingList(id: string) {
    const res = await getDoc(doc(firestore, USERS_KEY, getUserId(), PACKING_LISTS_KEY, id));
    if (res.exists()) {
      return { id: res.id, ...res.data() } as NamedEntity;
    }
    return undefined;
  },
  updatePackingList(packingList: NamedEntity) {
    return update(PACKING_LISTS_KEY, packingList.id, packingList);
  },
  deletePackingListBatch(id: string, batch: WriteBatch) {
    batch.delete(doc(firestore, USERS_KEY, getUserId(), PACKING_LISTS_KEY, id));
  },
  addPackingListBatch(name: string, writeBatch: WriteBatch, rank: number) {
    return addBatch(PACKING_LISTS_KEY, writeBatch, { name, rank });
  },
  updateCategoryBatch<K extends DocumentData>(data: WithFieldValue<K>, batch: WriteBatch) {
    batch.update(doc(firestore, USERS_KEY, getUserId(), CATEGORIES_KEY, data.id), data);
  },
  getPackItemsForAllPackingLists: async () => {
    const userId = getUserId();
    const q = query(collection(firestore, USERS_KEY, userId, PACK_ITEMS_KEY));
    const allPackItems = fromQueryResult<PackItem>(await getDocs(q));
    sortEntities(allPackItems);
    return allPackItems;
  },
};

function getUserId() {
  const userId = getAuth().currentUser?.uid;
  if (!userId) {
    throw new Error('No user logged in');
  }
  return userId;
}

// Generic function to update one or multiple NamedEntity documents
async function updateNamedEntities(collectionKey: string, entities: NamedEntity[] | NamedEntity) {
  if (Array.isArray(entities)) {
    await updateInBatch(collectionKey, entities);
  } else {
    await update(collectionKey, entities.id, entities);
  }
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

function throwNamedEntityArrayError(type: string, packItems: PackItem[], packingLists: NamedEntity[]) {
  throw new ArrayError([
    `${type} was not deleted. It's in use by the following pack items:`,
    ...packItems.slice(0, 5).map((t) => {
      const packingListName = packingLists.find((pl) => pl.id === t.packingList)?.name;
      return t.name + (packingListName ? ` (in ${packingListName})` : '');
    }),
    packItems.length > 5 ? ' and more...' : '',
  ]);
}
