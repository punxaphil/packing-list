import { Box, Flex, HStack, Input, Stack, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AiFillCaretDown, AiOutlineCopy, AiOutlineDelete, AiOutlineUnorderedList } from 'react-icons/ai';
import { IoMdAdd } from 'react-icons/io';
import { useNavigate } from 'react-router';
import { firebase } from '../../services/firebase.ts';
import { findUniqueName } from '../../services/utils.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { ProfileAvatar } from '../auth/ProfileAvatar.tsx';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { usePackingListId } from '../providers/PackingListContext.ts';
import { IconSelect } from './IconSelect.tsx';
import { NavButton } from './NavButton.tsx';
import { PLIconButton } from './PLIconButton.tsx';

export function Header() {
  const { packingListId, setPackingListId } = usePackingListId();
  const { packingLists, packItems } = useFirebase();
  const [packingList, setPackingList] = useState<NamedEntity>();
  const navigate = useNavigate();
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
        packItem.category,
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

  function onShowLists() {
    navigate('/packing-lists');
  }

  return (
    <>
      {packingList && (
        <>
          <Flex align="center" justifyContent="space-between" m="3" key={packingListId}>
            <img src="/squirrel_icon.png" alt="squirrel icon" />

            <Input
              key={packingList.id}
              value={packingList.name}
              onChange={(e) => savePackingListName(e.target.value)}
              w="min"
              textAlign="right"
              fontSize={['xl', '4xl']}
              flex={1}
              p={0}
              variant="unstyled"
            />
            <Box flex={1}>
              <IconSelect
                label="Choose another packing list"
                icon={<AiFillCaretDown />}
                items={[
                  ...packingLists.filter((l) => l.id !== packingListId),
                  { id: '', name: 'Create new packing list' },
                ]}
                onClick={onSelectPackingList}
                emptyIcon={<IoMdAdd />}
                size={['sm', 'md']}
              />
              <PLIconButton
                onClick={onDelete}
                icon={<AiOutlineDelete />}
                aria-label="Delete packing list"
                size={['sm', 'md']}
              />
              <PLIconButton
                onClick={onCopy}
                icon={<AiOutlineCopy />}
                aria-label="Copy packing list"
                size={['sm', 'md']}
              />
              <PLIconButton
                onClick={onShowLists}
                icon={<AiOutlineUnorderedList />}
                aria-label="Show all packing lists"
                size={['sm', 'md']}
              />
            </Box>
            <HStack w="50px" justifyContent="flex-end">
              <ProfileAvatar size="sm" />
            </HStack>
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
