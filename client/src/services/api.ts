import { Member } from '../types/Member.tsx';
import { Item } from '../types/Item.tsx';
import { Dispatch, SetStateAction } from 'react';

const HOSTNAME = 'http://localhost:8080';
const MEMBERS_KEY = 'members';
const ITEMS_KEY = 'items';

export function loadData(setInitialMembers: Dispatch<SetStateAction<Member[]>>, setInitialItems: Dispatch<SetStateAction<Item[]>>, setLoading: Dispatch<SetStateAction<boolean>>) {
  fetch(`${HOSTNAME}/read?key=${MEMBERS_KEY}`)
    .then(res => res.json())
    .then(data => setInitialMembers(data as Member[]))
    .then(() => fetch(`${HOSTNAME}/read?key=${ITEMS_KEY}`))
    .then(res => res.json())
    .then(data => setInitialItems(data as Item[]))
    .then(() => setLoading(false))
    .catch(e => console.error(e));
}

function saveData<K>(key: string, value: K) {
  fetch(`${HOSTNAME}/write`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, value }),
  }).catch((err) => {
    console.log('save, Unable to post -', err);
  });
}

export function saveItems(items: Item[]) {
  saveData(ITEMS_KEY, items);
}

export function saveMembers(members: Member[]) {
  saveData(MEMBERS_KEY, members);
}
