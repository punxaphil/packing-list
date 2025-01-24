import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Member } from '../types/Member.tsx';
import { Item } from '../types/Item.tsx';
import { Category } from '../types/Category.tsx';

const MEMBERS_KEY = 'members';
const ITEMS_KEY = 'items';
const CATEGORIES_KEY = 'categories';


export function loadData(setInitialMembers: React.Dispatch<React.SetStateAction<Member[]>>, setInitialItems: React.Dispatch<React.SetStateAction<Item[]>>, setInitialCategories: (value: (((prevState: Category[]) => Category[]) | Category[])) => void, setLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  getDocs(collection(db, MEMBERS_KEY))
    .then(res => res.docs[0] ? res.docs[0].data().value as Member[] : [])
    .then(data => setInitialMembers(data))
    .then(() => getDocs(collection(db, ITEMS_KEY)))
    .then(res => res.docs[0] ? res.docs[0].data().value as Item[] : [])
    .then(data => setInitialItems(data))
    .then(() => getDocs(collection(db, CATEGORIES_KEY)))
    .then(res => res.docs[0] ? res.docs[0].data().value as Category[] : [])
    .then(data => setInitialCategories(data))
    .then(() => setLoading(false))
    .catch(e => console.error(e));
}

function saveData(key: string, value: Item[] | Member[]) {
  addDoc(collection(db, key), { value })
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
