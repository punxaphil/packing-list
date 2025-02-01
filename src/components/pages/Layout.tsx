import { FirebaseContext } from '../../services/contexts.ts';
import NavButton from '../shared/NavButton.tsx';
import { getUserCollectionsAndSubscribe } from '../../services/api.ts';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { PackItem } from '../../types/PackItem.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { Flex, Heading, Stack } from '@chakra-ui/react';
import { Logout } from '../auth/Auth.tsx';
import { Outlet } from 'react-router';

export function Layout({ userId, title }: { userId: string; title?: string }) {
  const [members, setMembers] = useState<NamedEntity[]>([]);
  const [categories, setCategories] = useState<NamedEntity[]>([]);
  const [items, setItems] = useState<PackItem[]>([]);

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
          <Stack direction="row" spacing={4} align="center" pt="3">
          <NavButton name="Home" path="/"></NavButton>
              <NavButton name="Members" path="members"></NavButton>
              <NavButton name="Categories" path="categories"></NavButton>
          </Stack>
          <Outlet />
        </FirebaseContext.Provider>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
