import { Flex, Heading, IconButton, Spacer, Stack, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiFillCaretDown, AiOutlineCopy, AiOutlineDelete } from 'react-icons/ai';
import { IoMdAdd } from 'react-icons/io';
import { firebase } from '../../services/firebase.ts';
import { findUniqueName } from '../../services/utils.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { ProfileAvatar } from '../auth/ProfileAvatar.tsx';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { IconSelect } from './IconSelect.tsx';
import { InlineEdit } from './InlineEdit.tsx';
import { NavButton } from './NavButton.tsx';

export function Header() {
  const { packingListId, setPackingListId } = usePackingListId();
  const packingLists = useFirebase().packingLists;
  const packItems = useFirebase().packItems;
  const [packingList, setPackingList] = useState<NamedEntity>();
  const toast = useToast();
  useEffect(() => {
    const initialPackingList = packingLists.find((packingList) => packingList.id === packingListId) as NamedEntity;
    setPackingList(initialPackingList);
  }, [packingListId, packingLists]);

  async function savePackingListName(name: string) {
    if (packingList) {
      packingList.name = name;
      await firebase.updatePackingList(packingList);
    }
  }

  async function onSelectPackingList(selectedPackingList: string) {
    if (!selectedPackingList) {
      const name = findUniqueName('My packing list', packingLists);
      const newId = await firebase.addPackingList(name);
      setPackingListId(newId);
    } else {
      setPackingListId(selectedPackingList);
    }
  }

  async function onDelete() {
    if (packItems.length) {
      showToast('Cannot delete packing list if it contains items');
    } else if (packingLists.length === 1) {
      showToast('Cannot delete last packing list');
    } else {
      await firebase.deletePackingList(packingListId);
      const filtered = packingLists.filter((l) => l.id !== packingListId);
      const selectedPackingList = filtered[0];
      setPackingListId(selectedPackingList.id);
    }
  }

  function showToast(description: string) {
    toast({
      title: 'Delete failed.',
      description: description,
      status: 'error',
      duration: 9000,
      isClosable: true,
    });
  }

  async function onCopy() {
    const name = findUniqueName(`${packingList?.name} - Copy`, packingLists);
    const batch = firebase.initBatch();
    const packingListId = firebase.addPackingListBatch(name, batch);
    for (const packItem of packItems) {
      firebase.addPackItemBatch(
        batch,
        packItem.name,
        packItem.members,
        packItem.category ?? '',
        packItem.rank,
        packingListId
      );
    }
    await batch.commit();
    setPackingListId(packingListId);
    toast({
      title: 'Packing list copied',
      description: `'${name}' created from '${packingList?.name}'`,
      status: 'success',
      duration: 9000,
    });
  }

  return (
    <>
      {packingList && (
        <>
          <Flex align="center" justifyContent="space-between" m="3" key={packingListId}>
            <img src="/squirrel_icon.png" alt="squirrel icon" />
            <Spacer />
            <Heading as="h1" mr="2" size={['md', 'xl']}>
              <InlineEdit key={packingList.id} value={packingList.name} onUpdate={savePackingListName} />
            </Heading>
            <IconSelect
              label="Choose another packing list"
              icon={<AiFillCaretDown />}
              items={[
                ...packingLists.filter((l) => l.id !== packingListId),
                { id: '', name: 'Create new packing list' },
              ]}
              onClick={onSelectPackingList}
              emptyIcon={<IoMdAdd />}
            />
            <IconButton
              onClick={onDelete}
              variant="ghost"
              icon={<AiOutlineDelete />}
              aria-label="Delete packing list"
            />
            <IconButton onClick={onCopy} variant="ghost" icon={<AiOutlineCopy />} aria-label="Copy packing list" />
            <Spacer />
            <ProfileAvatar size="sm" />
          </Flex>
          <Stack direction="row" spacing={2} align="center" pt="3" justifyContent="center">
            <NavButton name="Home" path="/" />
            <NavButton name="Members" path="members" />
            <NavButton name="Categories" path="categories" />
            <NavButton name="Profile" path="profile" />
          </Stack>
        </>
      )}
    </>
  );
}
