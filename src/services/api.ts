import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Member } from '../types/Member.tsx';
import { Item } from '../types/Item.tsx';
import { Category } from '../types/Category.tsx';
import { FirebaseValue } from '../types/firebaseValue.ts';

const MEMBERS_KEY = 'members';
const ITEMS_KEY = 'items';
const CATEGORIES_KEY = 'categories';

export function loadData(
  setInitialMembers: (m: Member[]) => void,
  setInitialItems: (i: Item[]) => void,
  setInitialCategories: (c: Category[]) => void,
  setLoading: (l: boolean) => void,
) {
  getDocs(collection(db, MEMBERS_KEY))
    .then(res => getValue(res as unknown as FirebaseValue<Member>))
    .then(data => setInitialMembers(data))
    .then(() => getDocs(collection(db, ITEMS_KEY)))
    .then(res => getValue(res as unknown as FirebaseValue<Item>))
    .then(data => setInitialItems(data))
    .then(() => getDocs(collection(db, CATEGORIES_KEY)))
    .then(res => getValue(res as unknown as FirebaseValue<Category>))
    .then(data => setInitialCategories(data))
    .then(() => setLoading(false))
    .catch(e => console.error(e));
}

function getValue<K>(res: FirebaseValue<K>): K[] {
  return res.docs[0] ? res.docs[0].data().value : [];
}

function saveData(key: string, value: Item[] | Member[]) {
  getDocs(collection(db, key))
    .then(res => {
      const id = res.docs[0]?.id;
      if (id) {
        return updateDoc(doc(db, key, id), { value });
      } else {
        addDoc(collection(db, key), { value }).catch(e => console.error(e));
      }
    })
    .catch((err) => console.log('save, Unable to post -', err));
}

export function saveItems(items: Item[]) {
  saveData(ITEMS_KEY, items);
}

export function saveMembers(members: Member[]) {
  saveData(MEMBERS_KEY, members);
}

export function saveCategories(categories: Category[]) {
  saveData(CATEGORIES_KEY, categories);
}
