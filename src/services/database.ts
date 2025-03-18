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
import { HistoryItem } from '~/types/HistoryItem.ts';
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

export class Database {
  private static readonly CATEGORIES_KEY = 'categories';
  private static readonly MEMBERS_KEY = 'members';
  private static readonly PACK_ITEMS_KEY = 'packItems';
  private static readonly USERS_KEY = 'users';
  private static readonly IMAGES_KEY = 'images';
  private static readonly PACKING_LISTS_KEY = 'packingLists';

  private firestore;
  private subs: (() => void)[] = [];
  private changeHistory: HistoryItem[];
  private setChangeHistory: (changeHistory: HistoryItem[]) => void;

  constructor(changeHistory: HistoryItem[], setChangeHistory: (changeHistory: HistoryItem[]) => void) {
    const app = initializeApp(firebaseConfig);
    this.firestore = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
    this.changeHistory = changeHistory;
    this.setChangeHistory = setChangeHistory;
  }

  private unsubscribeAll() {
    for (const unsubscribe of this.subs) {
      unsubscribe();
    }
    this.subs.length = 0;
  }

  private getUserId() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) {
      throw new Error('No user logged in');
    }
    return userId;
  }

  private fromQueryResult<K>(res: QuerySnapshot) {
    return res.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as K[];
  }

  private async add<K extends DocumentData>(userColl: string, data: WithFieldValue<K>) {
    const coll = collection(this.firestore, Database.USERS_KEY, this.getUserId(), userColl);
    const docRef = await addDoc(coll, data);
    if (docRef) {
      return docRef;
    }
    throw new Error('Unable to add to database');
  }

  private async updateInBatch<K extends DocumentData>(userColl: string, data: WithFieldValue<K>[]) {
    const batch = writeBatch(this.firestore);
    const coll = collection(this.firestore, Database.USERS_KEY, this.getUserId(), userColl);
    for (const d of data) {
      batch.update(doc(coll, d.id), d);
    }
    await batch.commit();
  }

  private async update<K extends DocumentData>(userColl: string, id: string, data: WithFieldValue<K>) {
    const coll = collection(this.firestore, Database.USERS_KEY, this.getUserId(), userColl);
    await updateDoc(doc(coll, id), data);
  }

  private async del(userColl: string, id: string) {
    await deleteDoc(doc(this.firestore, Database.USERS_KEY, this.getUserId(), userColl, id));
  }

  private addBatch<K extends DocumentData>(userColl: string, writeBatch: WriteBatch, data: WithFieldValue<K>) {
    const docRef = doc(collection(this.firestore, Database.USERS_KEY, this.getUserId(), userColl));
    writeBatch.set(docRef, data);
    return docRef.id;
  }

  private throwNamedEntityArrayError(type: string, packItems: PackItem[], packingLists: NamedEntity[]) {
    throw new ArrayError([
      `${type} was not deleted. It's in use by the following pack items:`,
      ...packItems.slice(0, 5).map((t) => {
        const packingListName = packingLists.find((pl) => pl.id === t.packingList)?.name;
        return t.name + (packingListName ? ` (in ${packingListName})` : '');
      }),
      packItems.length > 5 ? ' and more...' : '',
    ]);
  }

  async getUserCollectionsAndSubscribe(
    setMembers: (members: NamedEntity[]) => void,
    setCategories: (categories: NamedEntity[]) => void,
    setPackItems: (packItems: PackItem[]) => void,
    setImages: (images: Image[]) => void,
    setPackingLists: (packingLists: NamedEntity[]) => void,
    packingListId: string
  ) {
    const userId = this.getUserId();
    const memberQuery = collection(this.firestore, Database.USERS_KEY, userId, Database.MEMBERS_KEY);
    const itemsQuery = query(
      collection(this.firestore, Database.USERS_KEY, userId, Database.PACK_ITEMS_KEY),
      where('packingList', '==', packingListId)
    );
    const categoriesQuery = collection(this.firestore, Database.USERS_KEY, userId, Database.CATEGORIES_KEY);
    const imagesQuery = collection(this.firestore, Database.USERS_KEY, userId, Database.IMAGES_KEY);
    const packingListsQuery = collection(this.firestore, Database.USERS_KEY, userId, Database.PACKING_LISTS_KEY);

    await this.getInitialData();
    this.createSubscriptions();

    async function getInitialData() {
      setMembers(this.fromQueryResult(await getDocs(memberQuery)));
      setCategories(this.fromQueryResult(await getDocs(categoriesQuery)));
      setPackItems(this.fromQueryResult(await getDocs(itemsQuery)));
      setImages(this.fromQueryResult(await getDocs(imagesQuery)));
      setPackingLists(this.fromQueryResult(await getDocs(packingListsQuery)));
    }

    function createSubscriptions() {
      this.unsubscribeAll();
      this.subs.push(onSnapshot(memberQuery, (res) => setMembers(this.fromQueryResult(res))));
      this.subs.push(onSnapshot(categoriesQuery, (res) => setCategories(this.fromQueryResult(res))));
      this.subs.push(onSnapshot(itemsQuery, (res) => setPackItems(this.fromQueryResult<PackItem>(res))));
      this.subs.push(onSnapshot(imagesQuery, (res) => setImages(this.fromQueryResult(res))));
      this.subs.push(onSnapshot(packingListsQuery, (res) => setPackingLists(this.fromQueryResult(res))));
    }
  }

  async addPackItem(
    name: string,
    members: MemberPackItem[],
    category: string,
    packingList: string,
    rank: number
  ): Promise<PackItem> {
    const docRef = await this.add(Database.PACK_ITEMS_KEY, {
      name,
      members,
      checked: false,
      category,
      packingList,
      rank,
    });
    return { id: docRef.id, checked: false, members, name, category, packingList, rank };
  }

  async updatePackItem(packItem: PackItem) {
    await this.update(Database.PACK_ITEMS_KEY, packItem.id, packItem);
  }

  async deletePackItem(packItem: PackItem) {
    await this.del(Database.PACK_ITEMS_KEY, packItem.id);
    const newHistory: HistoryItem[] = [...this.changeHistory, { type: 'deleted', packItem }];
    this.setChangeHistory(newHistory);
  }

  async addMember(name: string): Promise<string> {
    const docRef = await this.add(Database.MEMBERS_KEY, { name });
    return docRef.id;
  }

  async updateMembers(toUpdate: NamedEntity[] | NamedEntity) {
    if (Array.isArray(toUpdate)) {
      await this.updateInBatch(Database.MEMBERS_KEY, toUpdate);
    } else {
      await this.update(Database.MEMBERS_KEY, toUpdate.id, toUpdate);
    }
  }

  async addCategory(name: string): Promise<string> {
    const docRef = await this.add(Database.CATEGORIES_KEY, { name });
    return docRef.id;
  }

  async updateCategories(categories: NamedEntity[] | NamedEntity) {
    if (Array.isArray(categories)) {
      await this.updateInBatch(Database.CATEGORIES_KEY, categories);
    } else {
      await this.update(Database.CATEGORIES_KEY, categories.id, categories);
    }
  }

  async updatePackingLists(packingLists: NamedEntity[] | NamedEntity) {
    if (Array.isArray(packingLists)) {
      await this.updateInBatch(Database.PACKING_LISTS_KEY, packingLists);
    } else {
      await this.update(Database.PACKING_LISTS_KEY, packingLists.id, packingLists);
    }
  }

  async addImage(type: string, typeId: string, url: string): Promise<void> {
    await this.add(Database.IMAGES_KEY, { type, typeId, url });
  }

  async updateImage(imageId: string, fileUrl: string) {
    await this.update(Database.IMAGES_KEY, imageId, { url: fileUrl });
  }

  async deleteImage(imageId: string) {
    await this.del(Database.IMAGES_KEY, imageId);
  }

  initBatch() {
    return writeBatch(this.firestore);
  }

  deletePackItemBatch(id: string, writeBatch: WriteBatch) {
    writeBatch.delete(doc(this.firestore, Database.USERS_KEY, this.getUserId(), Database.PACK_ITEMS_KEY, id));
  }

  addCategoryBatch(category: string, writeBatch: WriteBatch) {
    return this.addBatch(Database.CATEGORIES_KEY, writeBatch, { name: category });
  }

  addMemberBatch(member: string, writeBatch: WriteBatch) {
    return this.addBatch(Database.MEMBERS_KEY, writeBatch, { name: member });
  }

  updatePackItemBatch<K extends DocumentData>(data: WithFieldValue<K>, writeBatch: WriteBatch) {
    writeBatch.update(
      doc(this.firestore, Database.USERS_KEY, this.getUserId(), Database.PACK_ITEMS_KEY, data.id),
      data
    );
  }

  addPackItemBatch(
    writeBatch: WriteBatch,
    name: string,
    members: MemberPackItem[],
    category: string,
    rank: number,
    packingList: string
  ) {
    return this.addBatch(Database.PACK_ITEMS_KEY, writeBatch, {
      name,
      members,
      checked: false,
      category,
      packingList,
      rank,
    });
  }

  async deleteCategory(id: string, packingLists: NamedEntity[], deleteEvenIfUsed = false) {
    const packItemsQuery = query(
      collection(this.firestore, Database.USERS_KEY, this.getUserId(), Database.PACK_ITEMS_KEY),
      where('category', '==', id)
    );
    const packItems: PackItem[] = this.fromQueryResult(await getDocs(packItemsQuery));
    if (packItems.length) {
      if (!deleteEvenIfUsed) {
        this.throwNamedEntityArrayError('Category', packItems, packingLists);
      }
      const batch = writeBatch(this.firestore);
      for (const packItem of packItems) {
        packItem.category = '';
        this.updatePackItemBatch(packItem, batch);
      }
      await batch.commit();
    }
    await this.del(Database.CATEGORIES_KEY, id);
  }

  async deleteMember(id: string, packingLists: NamedEntity[], deleteEvenIfUsed = false) {
    const packItemsQuery = query(
      collection(this.firestore, Database.USERS_KEY, this.getUserId(), Database.PACK_ITEMS_KEY),
      where('members', '!=', [])
    );
    let packItems: PackItem[] = this.fromQueryResult(await getDocs(packItemsQuery));
    packItems = packItems.filter((t) => t.members.find((m) => m.id === id));

    if (packItems.length) {
      if (!deleteEvenIfUsed) {
        this.throwNamedEntityArrayError('Member', packItems, packingLists);
      }
      const batch = writeBatch(this.firestore);
      for (const packItem of packItems) {
        packItem.members = packItem.members.filter((m) => m.id !== id);
        this.updatePackItemBatch(packItem, batch);
      }
      await batch.commit();
    }
    await this.del(Database.MEMBERS_KEY, id);
  }

  async getFirstPackingList(): Promise<NamedEntity | undefined> {
    const userId = this.getUserId();
    const query = collection(this.firestore, Database.USERS_KEY, userId, Database.PACKING_LISTS_KEY);
    const packingLists = this.fromQueryResult(await getDocs(query)) as NamedEntity[];
    return packingLists.length ? packingLists[0] : undefined;
  }

  async addPackingList(name: string, rank: number) {
    const docRef = await this.add(Database.PACKING_LISTS_KEY, { name: name, rank });
    return docRef.id;
  }

  async getPackingList(id: string) {
    const res = await getDoc(doc(this.firestore, Database.USERS_KEY, this.getUserId(), Database.PACKING_LISTS_KEY, id));
    if (res.exists()) {
      return { id: res.id, ...res.data() } as NamedEntity;
    }
    return undefined;
  }

  updatePackingList(packingList: NamedEntity) {
    return this.update(Database.PACKING_LISTS_KEY, packingList.id, packingList);
  }

  deletePackingListBatch(id: string, batch: WriteBatch) {
    batch.delete(doc(this.firestore, Database.USERS_KEY, this.getUserId(), Database.PACKING_LISTS_KEY, id));
  }

  addPackingListBatch(name: string, writeBatch: WriteBatch, rank: number) {
    return this.addBatch(Database.PACKING_LISTS_KEY, writeBatch, { name, rank });
  }

  updateCategoryBatch<K extends DocumentData>(data: WithFieldValue<K>, batch: WriteBatch) {
    batch.update(doc(this.firestore, Database.USERS_KEY, this.getUserId(), Database.CATEGORIES_KEY, data.id), data);
  }

  async getPackItemsForAllPackingLists() {
    const userId = this.getUserId();
    const q = query(collection(this.firestore, Database.USERS_KEY, userId, Database.PACK_ITEMS_KEY));
    const allPackItems = this.fromQueryResult<PackItem>(await getDocs(q));
    sortEntities(allPackItems);
    return allPackItems;
  }

  async undo() {
    const last = this.changeHistory.pop();
    if (!last) {
      return;
    }
    if (last.type === 'deleted') {
      if (last.packItem) {
        const docRef = await this.add(Database.PACK_ITEMS_KEY, last.packItem);
        if (docRef) {
          await this.update(Database.PACK_ITEMS_KEY, docRef.id, { ...last.packItem, id: docRef.id });
        }
      }
    }
  }
}

export type DbInvoke = Database;

export const getDatabase = (changeHistory: HistoryItem[], setChangeHistory: (changeHistory: HistoryItem[]) => void) => {
  return new Database(changeHistory, setChangeHistory);
};
