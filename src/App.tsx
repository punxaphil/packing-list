import '@radix-ui/themes/styles.css';

import PackingList from './components/packing-list/PackingList.tsx';
import Members from './components/member/Members.tsx';

import { Provider } from './components/Provider.tsx';
import { useEffect, useState } from 'react';
import NavButton from './components/shared/NavButton.tsx';
import { Member } from './types/Member.tsx';
import { Item } from './types/Item.tsx';
import { loadData } from './services/api.ts';
import { Category } from './types/Category.tsx';
import Categories from './components/category/Categories.tsx';
import { Box, Flex, Heading, Theme } from '@radix-ui/themes';
import { Auth, useCurrentUser } from './components/auth/Auth.tsx';

const TITLE = "Pack'n'Go!";

export default function App() {
  const [page, setPage] = useState('Home');
  const [loading, setLoading] = useState(true);
  const [initialMembers, setInitialMembers] = useState<Member[]>([]);
  const [initialItems, setInitialItems] = useState<Item[]>([]);
  const [initialCategories, setInitialCategories] = useState<Category[]>([]);
  const [currentUser] = useCurrentUser();

  useEffect(() => loadData(setInitialMembers, setInitialItems, setInitialCategories, setLoading), []);

  const isLoggedIn = !!currentUser;
  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Provider initialMembers={initialMembers} initialItems={initialItems} initialCategories={initialCategories}>
          <Theme accentColor="teal">
            <Box>
              <Flex gap="3" align="center" justify="between" my="3">
                <Flex gap="3" align="center">
                  <img src="/squirrel_icon.png" alt="squirrel icon" />
                  <Heading as="h1">{TITLE}</Heading>
                </Flex>
                <Auth />
              </Flex>
              {isLoggedIn ? (
                <>
                  <Flex gap="3" mb="3">
                    <NavButton name={'Home'} page={page} setPage={setPage}></NavButton>
                    <NavButton name={'Members'} page={page} setPage={setPage}></NavButton>
                    <NavButton name={'Categories'} page={page} setPage={setPage}></NavButton>
                  </Flex>
                  {page === 'Home' && <PackingList></PackingList>}
                  {page === 'Members' && <Members></Members>}
                  {page === 'Categories' && <Categories></Categories>}
                </>
              ) : (
                <Flex justify="between" direction="column" align="center" gap="3">
                  <Heading as="h3">Welcome to {TITLE}</Heading>
                  <Box>
                    Start preparing your trip by logging in or registering in the top right corner of this page ✈️
                  </Box>
                  <img src="/squirrel_400.png" alt="squirrel" />
                </Flex>
              )}
            </Box>
          </Theme>
        </Provider>
      )}
    </>
  );
}
