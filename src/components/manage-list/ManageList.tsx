import { FirebaseContext } from '../../services/contexts.ts';
import NavButton from '../shared/NavButton.tsx';
import PackingList from '../packing-list/PackingList.tsx';
import Members from '../member/Members.tsx';
import Categories from '../category/Categories.tsx';
import { getUserData } from '../../services/api.ts';
import { useEffect, useState } from 'react';
import { Flex } from '@radix-ui/themes';
import { getAuth } from 'firebase/auth';
import { Item } from '../../types/Item.ts';
import { Category } from '../../types/Category.ts';
import { Member } from '../../types/Member.ts';

export function ManageList({ userId }: { userId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState('Home');

  useEffect(() => {
    (async function () {
      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        throw new Error('No user logged in');
      }
      const initialData = await getUserData(setMembers, setCategories, setItems);
      setMembers(initialData.members);
      setCategories(initialData.categories);
      setItems(initialData.items);
    })().catch(console.error);
  }, []);
  return (
    <>
      {members ? (
        <FirebaseContext.Provider value={{ id: userId, members, categories, items }}>
          <Flex gap="3" mb="3">
            <NavButton name={'Home'} page={page} setPage={setPage}></NavButton>
            <NavButton name={'Members'} page={page} setPage={setPage}></NavButton>
            <NavButton name={'Categories'} page={page} setPage={setPage}></NavButton>
          </Flex>
          {page === 'Home' && <PackingList></PackingList>}
          {page === 'Members' && <Members></Members>}
          {page === 'Categories' && <Categories></Categories>}
        </FirebaseContext.Provider>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
