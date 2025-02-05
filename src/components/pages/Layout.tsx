import { FirebaseContext } from '../../services/contexts.ts';
import { NavButton } from '../shared/NavButton.tsx';
import { getUserCollectionsAndSubscribe } from '../../services/api.ts';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { PackItem } from '../../types/PackItem.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { Flex, Heading, Spacer, Spinner, Stack } from '@chakra-ui/react';
import { Outlet } from 'react-router';
import { Image } from '../../types/Image.ts';
import { sortAll } from '../../services/utils.ts';
import { ProfileAvatar } from '../auth/ProfileAvatar.tsx';

export function Layout({ userId, title }: { userId: string; title?: string }) {
  const [members, setMembers] = useState<NamedEntity[]>();
  const [categories, setCategories] = useState<NamedEntity[]>();
  const [packItems, setPackItems] = useState<PackItem[]>();
  const [images, setImages] = useState<Image[]>();

  useEffect(() => {
    (async function () {
      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        throw new Error('No user logged in');
      }
      await getUserCollectionsAndSubscribe(setMembers, setCategories, setPackItems, setImages);
    })().catch(console.error);
  }, []);

  const isInitialized = members && categories && packItems && images;
  if (isInitialized) {
    sortAll(members, categories, packItems);
  }
  return (
    <>
      {isInitialized ? (
        <FirebaseContext.Provider value={{ id: userId, members, categories, packItems, images }}>
          <Flex align="center" justifyContent="space-between" m="3">
            <img src="/squirrel_icon.png" alt="squirrel icon" />
            <Heading as="h1">{title}</Heading>
            <ProfileAvatar size="sm" />
          </Flex>
          <Stack direction="row" spacing={2} align="center" pt="3" justifyContent="center">
            <NavButton name="Home" path="/"></NavButton>
            <NavButton name="Members" path="members"></NavButton>
            <NavButton name="Categories" path="categories"></NavButton>
            <NavButton name="Profile" path="profile"></NavButton>
          </Stack>
          <Outlet />
        </FirebaseContext.Provider>
      ) : (
        <Flex>
          <Spacer />
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal" size="xl" />
          <Spacer />
        </Flex>
      )}
    </>
  );
}
