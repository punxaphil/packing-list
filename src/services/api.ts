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

export class Api {
  private readonly changeHistory: HistoryItem[];
  private readonly setChangeHistory: (changeHistory: HistoryItem[]) => void;
  private subs: (() => void)[] = [];
  private readonly userId;
  private readonly memberQuery;
  private readonly categoriesQuery;
  private readonly imagesQuery;
  private readonly packingListsQuery;

  constructor(changeHistory: HistoryItem[], setChangeHistory: (changeHistory: HistoryItem[]) => void) {
    this.changeHistory = changeHistory;
    this.setChangeHistory = setChangeHistory;
    this.userId = this.getUserId();
    this.memberQuery = collection(firestore, USERS_KEY, this.userId, MEMBERS_KEY);
    this.categoriesQuery = collection(firestore, USERS_KEY, this.userId, CATEGORIES_KEY);
    this.imagesQuery = collection(firestore, USERS_KEY, this.userId, IMAGES_KEY);
    this.packingListsQuery = collection(firestore, USERS_KEY, this.userId, PACKING_LISTS_KEY);
  }

  unsubscribeAll() {
    for (const unsubscribe of this.subs) {
      unsubscribe();
    }
    this.subs.length = 0;
  }

  getUserId() {
    const userId = getAuth().currentUser?.uid;
    if (!userId) {
      throw new Error('No user logged in');
    }
    return userId;
  }

  fromQueryResult<K>(res: QuerySnapshot) {
    return res.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as K[];
  }

  async add<K extends DocumentData>(userColl: string, data: WithFieldValue<K>) {
    const coll = collection(firestore, USERS_KEY, this.getUserId(), userColl);
    const docRef = await addDoc(coll, data);
    if (docRef) {
      return docRef;
    }
    throw new Error('Unable to add to database');
  }

  async updateInBatch<K extends DocumentData>(userColl: string, data: WithFieldValue<K>[]) {
    const batch = writeBatch(firestore);
    const coll = collection(firestore, USERS_KEY, this.getUserId(), userColl);
    for (const d of data) {
      batch.update(doc(coll, d.id), d);
    }
    await batch.commit();
  }

  async update<K extends DocumentData>(userColl: string, id: string, data: WithFieldValue<K>) {
    const coll = collection(firestore, USERS_KEY, this.getUserId(), userColl);
    await updateDoc(doc(coll, id), data);
  }

  async del(userColl: string, id: string) {
    await deleteDoc(doc(firestore, USERS_KEY, this.getUserId(), userColl, id));
  }

  addBatch<K extends DocumentData>(userColl: string, writeBatch: WriteBatch, data: WithFieldValue<K>) {
    const docRef = doc(collection(firestore, USERS_KEY, this.getUserId(), userColl));
    writeBatch.set(docRef, data);
    return docRef.id;
  }

  throwNamedEntityArrayError(type: string, packItems: PackItem[], packingLists: NamedEntity[]) {
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
    await this.getInitialData(setMembers, setCategories, setPackItems, setImages, setPackingLists, packingListId);
    this.createSubscriptions(setMembers, setCategories, setPackItems, setImages, setPackingLists, packingListId);
  }

  private async getInitialData(
    setMembers: (members: NamedEntity[]) => void,
    setCategories: (categories: NamedEntity[]) => void,
    setPackItems: (packItems: PackItem[]) => void,
    setImages: (images: Image[]) => void,
    setPackingLists: (packingLists: NamedEntity[]) => void,
    packingListId: string
  ) {
    setMembers(this.fromQueryResult(await getDocs(this.memberQuery)));
    setCategories(this.fromQueryResult(await getDocs(this.categoriesQuery)));
    setPackItems(this.fromQueryResult(await getDocs(this.itemsQuery(packingListId))));
    setImages(this.fromQueryResult(await getDocs(this.imagesQuery)));
    setPackingLists(this.fromQueryResult(await getDocs(this.packingListsQuery)));
  }

  private createSubscriptions(
    setMembers: (members: NamedEntity[]) => void,
    setCategories: (categories: NamedEntity[]) => void,
    setPackItems: (packItems: PackItem[]) => void,
    setImages: (images: Image[]) => void,
    setPackingLists: (packingLists: NamedEntity[]) => void,
    packingListId: string
  ) {
    this.unsubscribeAll();

    this.subs.push(onSnapshot(this.memberQuery, (res: QuerySnapshot) => setMembers(this.fromQueryResult(res))));
    this.subs.push(onSnapshot(this.categoriesQuery, (res: QuerySnapshot) => setCategories(this.fromQueryResult(res))));
    this.subs.push(
      onSnapshot(this.itemsQuery(packingListId), (res: QuerySnapshot) =>
        setPackItems(this.fromQueryResult<PackItem>(res))
      )
    );
    this.subs.push(onSnapshot(this.imagesQuery, (res: QuerySnapshot) => setImages(this.fromQueryResult(res))));
    this.subs.push(
      onSnapshot(this.packingListsQuery, (res: QuerySnapshot) => setPackingLists(this.fromQueryResult(res)))
    );
  }

  async addPackItem(
    name: string,
    members: MemberPackItem[],
    category: string,
    packingList: string,
    rank: number
  ): Promise<PackItem> {
    const docRef = await this.add(PACK_ITEMS_KEY, { name, members, checked: false, category, packingList, rank });
    return { id: docRef.id, checked: false, members, name, category, packingList, rank };
  }

  async updatePackItem(packItem: PackItem) {
    await this.update(PACK_ITEMS_KEY, packItem.id, packItem);
  }

  async deletePackItem(packItem: PackItem) {
    await this.del(PACK_ITEMS_KEY, packItem.id);
    const newHistory: HistoryItem[] = [...this.changeHistory, { type: 'deleted', packItem }];
    this.setChangeHistory(newHistory);
  }

  async addMember(name: string): Promise<string> {
    const docRef = await this.add(MEMBERS_KEY, { name });
    return docRef.id;
  }

  async updateMembers(toUpdate: NamedEntity[] | NamedEntity) {
    if (Array.isArray(toUpdate)) {
      await this.updateInBatch(MEMBERS_KEY, toUpdate);
    } else {
      await this.update(MEMBERS_KEY, toUpdate.id, toUpdate);
    }
  }

  async addCategory(name: string): Promise<string> {
    const docRef = await this.add(CATEGORIES_KEY, { name });
    return docRef.id;
  }

  async updateCategories(categories: NamedEntity[] | NamedEntity) {
    if (Array.isArray(categories)) {
      await this.updateInBatch(CATEGORIES_KEY, categories);
    } else {
      await this.update(CATEGORIES_KEY, categories.id, categories);
    }
  }

  async updatePackingLists(packingLists: NamedEntity[] | NamedEntity) {
    if (Array.isArray(packingLists)) {
      await this.updateInBatch(PACKING_LISTS_KEY, packingLists);
    } else {
      await this.update(PACKING_LISTS_KEY, packingLists.id, packingLists);
    }
  }

  async addImage(type: string, typeId: string, url: string): Promise<void> {
    await this.add(IMAGES_KEY, { type, typeId, url });
  }

  async updateImage(imageId: string, fileUrl: string) {
    await this.update(IMAGES_KEY, imageId, { url: fileUrl });
  }

  async deleteImage(imageId: string) {
    await this.del(IMAGES_KEY, imageId);
  }

  public initBatch() {
    return writeBatch(firestore);
  }

  deletePackItemBatch(id: string, writeBatch: WriteBatch) {
    writeBatch.delete(doc(firestore, USERS_KEY, this.getUserId(), PACK_ITEMS_KEY, id));
  }

  addCategoryBatch(category: string, writeBatch: WriteBatch) {
    return this.addBatch(CATEGORIES_KEY, writeBatch, { name: category });
  }

  addMemberBatch(member: string, writeBatch: WriteBatch) {
    return this.addBatch(MEMBERS_KEY, writeBatch, { name: member });
  }

  updatePackItemBatch<K extends DocumentData>(data: WithFieldValue<K>, writeBatch: WriteBatch) {
    writeBatch.update(doc(firestore, USERS_KEY, this.getUserId(), PACK_ITEMS_KEY, data.id), data);
  }

  addPackItemBatch(
    writeBatch: WriteBatch,
    name: string,
    members: MemberPackItem[],
    category: string,
    rank: number,
    packingList: string
  ) {
    return this.addBatch(PACK_ITEMS_KEY, writeBatch, {
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
      collection(firestore, USERS_KEY, this.getUserId(), PACK_ITEMS_KEY),
      where('category', '==', id)
    );
    const packItems: PackItem[] = this.fromQueryResult(await getDocs(packItemsQuery));
    if (packItems.length) {
      if (!deleteEvenIfUsed) {
        this.throwNamedEntityArrayError('Category', packItems, packingLists);
      }
      const batch = writeBatch(firestore);
      for (const packItem of packItems) {
        packItem.category = '';
        this.updatePackItemBatch(packItem, batch);
      }
      await batch.commit();
    }
    await this.del(CATEGORIES_KEY, id);
  }

  async deleteMember(id: string, packingLists: NamedEntity[], deleteEvenIfUsed = false) {
    const packItemsQuery = query(
      collection(firestore, USERS_KEY, this.getUserId(), PACK_ITEMS_KEY),
      where('members', '!=', [])
    );
    let packItems: PackItem[] = this.fromQueryResult(await getDocs(packItemsQuery));
    packItems = packItems.filter((t) => t.members.find((m) => m.id === id));

    if (packItems.length) {
      if (!deleteEvenIfUsed) {
        this.throwNamedEntityArrayError('Member', packItems, packingLists);
      }
      const batch = writeBatch(firestore);
      for (const packItem of packItems) {
        packItem.members = packItem.members.filter((m) => m.id !== id);
        this.updatePackItemBatch(packItem, batch);
      }
      await batch.commit();
    }
    await this.del(MEMBERS_KEY, id);
  }

  async getFirstPackingList(): Promise<NamedEntity | undefined> {
    const userId = this.getUserId();
    const query = collection(firestore, USERS_KEY, userId, PACKING_LISTS_KEY);
    const packingLists = this.fromQueryResult(await getDocs(query)) as NamedEntity[];
    return packingLists.length ? packingLists[0] : undefined;
  }

  async addPackingList(name: string, rank: number) {
    const docRef = await this.add(PACKING_LISTS_KEY, { name: name, rank });
    return docRef.id;
  }

  async getPackingList(id: string) {
    const res = await getDoc(doc(firestore, USERS_KEY, this.getUserId(), PACKING_LISTS_KEY, id));
    if (res.exists()) {
      return { id: res.id, ...res.data() } as NamedEntity;
    }
    return undefined;
  }

  updatePackingList(packingList: NamedEntity) {
    return this.update(PACKING_LISTS_KEY, packingList.id, packingList);
  }

  deletePackingListBatch(id: string, batch: WriteBatch) {
    batch.delete(doc(firestore, USERS_KEY, this.getUserId(), PACKING_LISTS_KEY, id));
  }

  addPackingListBatch(name: string, writeBatch: WriteBatch, rank: number) {
    return this.addBatch(PACKING_LISTS_KEY, writeBatch, { name, rank });
  }

  updateCategoryBatch<K extends DocumentData>(data: WithFieldValue<K>, batch: WriteBatch) {
    batch.update(doc(firestore, USERS_KEY, this.getUserId(), CATEGORIES_KEY, data.id), data);
  }

  async getPackItemsForAllPackingLists() {
    const userId = this.getUserId();
    const q = query(collection(firestore, USERS_KEY, userId, PACK_ITEMS_KEY));
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
        const docRef = await this.add(PACK_ITEMS_KEY, last.packItem);
        if (docRef) {
          await this.update(PACK_ITEMS_KEY, docRef.id, { ...last.packItem, id: docRef.id });
        }
      }
    }
  }

  itemsQuery(packingListId: string) {
    return query(
      collection(firestore, USERS_KEY, this.userId, PACK_ITEMS_KEY),
      where('packingList', '==', packingListId)
    );
  }
}
