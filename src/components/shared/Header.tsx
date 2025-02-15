import { Flex, Heading, Spacer, Stack } from '@chakra-ui/react';
import { AiFillCaretDown } from 'react-icons/ai';
import { IoMdAdd } from 'react-icons/io';
import { firebase } from '../../services/firebase.ts';
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

  const packingList = packingLists.find((packingList) => packingList.id === packingListId) as NamedEntity;

  async function savePackingListName(name: string) {
    packingList.name = name;
    await firebase.updatePackingList(packingList);
  }

  async function onSelectPackingList(selectedPackingList: string) {
    if (!selectedPackingList) {
      const newId = await firebase.addPackingList('New packing list');
      setPackingListId(newId);
    }
    setPackingListId(selectedPackingList);
  }

  return (
    <>
      <Flex align="center" justifyContent="space-between" m="3">
        <img src="/squirrel_icon.png" alt="squirrel icon" />
        <Spacer />
        <Heading as="h1" mr="2">
          <InlineEdit key={packingList.id} value={packingList.name} onUpdate={savePackingListName} />
        </Heading>
        <IconSelect
          label="Choose another packing list"
          icon={<AiFillCaretDown />}
          items={[...packingLists.filter((l) => l.id !== packingListId), { id: '', name: 'Create new packing list' }]}
          onClick={onSelectPackingList}
          emptyIcon={<IoMdAdd />}
        />
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
  );
}
