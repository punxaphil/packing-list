import { Flex, Spacer, Spinner } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { sortAll } from '../../services/utils.ts';
import { Image } from '../../types/Image.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PackItem } from '../../types/PackItem.ts';
import { FirebaseContext } from './FirebaseContext.ts';
import { usePackingListId } from './PackingListContext.ts';

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<NamedEntity[]>();
  const [categories, setCategories] = useState<NamedEntity[]>();
  const [packItems, setPackItems] = useState<PackItem[]>();
  const [images, setImages] = useState<Image[]>();
  const [packingLists, setPackingLists] = useState<NamedEntity[]>();
  const { packingListId } = usePackingListId();

  useEffect(() => {
    (async () => {
      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        throw new Error('No user logged in');
      }
      if (packingListId) {
        await firebase.getUserCollectionsAndSubscribe(
          setMembers,
          setCategories,
          setPackItems,
          setImages,
          setPackingLists,
          packingListId
        );
      }
    })().catch(console.error);
  }, [packingListId]);

  const isInitialized = members && categories && packItems && images && packingLists;
  if (isInitialized) {
    sortAll(members, categories, packItems, packingLists);
  }
  return (
    <>
      {isInitialized ? (
        <FirebaseContext.Provider value={{ members, categories, packItems, images, packingLists }}>
          {children}
        </FirebaseContext.Provider>
      ) : (
        <Flex>
          <Spacer />
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" size="xl" />
          <Spacer />
        </Flex>
      )}
    </>
  );
}
