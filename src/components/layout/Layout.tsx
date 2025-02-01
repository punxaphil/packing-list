import { FirebaseContext } from '../../services/contexts.ts';
import NavButton from '../shared/NavButton.tsx';
import PackingList from '../packing-list/PackingList.tsx';
import Members from '../member/Members.tsx';
import Categories from '../category/Categories.tsx';
import { getUserCollectionsAndSubscribe } from '../../services/api.ts';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { PackItem } from '../../types/PackItem.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { Flex, Heading } from '@chakra-ui/react';
import { Logout } from '../auth/Auth.tsx';

export function Layout({ userId, title }: { userId: string; title?: string }) {
  const [members, setMembers] = useState<NamedEntity[]>([]);
  const [categories, setCategories] = useState<NamedEntity[]>([]);
  const [items, setItems] = useState<PackItem[]>([]);
  const [page, setPage] = useState('Home');

  useEffect(() => {
    (async function () {
      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        throw new Error('No user logged in');
      }
      await getUserCollectionsAndSubscribe(setMembers, setCategories, (items: PackItem[]) => setItems(items));
    })().catch(console.error);
  }, []);
  return (
    <>
      {members ? (
        <FirebaseContext.Provider value={{ id: userId, members, categories, items }}>
          <Flex align="center" justifyContent="space-between" m="3">
            <img src="/squirrel_icon.png" alt="squirrel icon" />
            <Heading as="h1">{title}</Heading>
            <Logout />
          </Flex>
          <Flex gap="3" mb="3">
            <NavButton name={'Home'} page={page} setPage={setPage}></NavButton>
            <NavButton name={'Members'} page={page} setPage={setPage}></NavButton>
            <NavButton name={'Categories'} page={page} setPage={setPage}></NavButton>
          </Flex>
          {page === 'Home' && <PackingList />}
          {page === 'Members' && <Members />}
          {page === 'Categories' && <Categories />}
        </FirebaseContext.Provider>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
