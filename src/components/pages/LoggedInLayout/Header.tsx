import { Flex, HStack, Input, Stack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { ProfileAvatar } from '~/components/auth/ProfileAvatar.tsx';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { writeDb } from '~/services/database.ts';
import { NavButton } from './NavButton.tsx';

export function Header() {
  const { packingList } = usePackingList();
  const [packingListName, setPackingListName] = useState('');
  useMemo(() => {
    setPackingListName(packingList.name);
  }, [packingList]);

  async function savePackingListName(name: string) {
    setPackingListName(name);
    packingList.name = name;
    await writeDb.updatePackingList(packingList);
  }

  return (
    <>
      <Flex align="center" justifyContent="space-between" m="3" key={packingList.id}>
        <img src="/squirrel_icon.png" alt="squirrel icon" />
        <Input
          key={packingList.id}
          value={packingListName}
          onChange={(e) => savePackingListName(e.target.value)}
          w="min"
          textAlign="center"
          fontSize={['xl', '4xl']}
          p={0}
          variant="unstyled"
          flexGrow={1}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          mx="2"
        />
        <HStack w="50px" justifyContent="flex-end">
          <ProfileAvatar size="sm" />
        </HStack>
      </Flex>
      <Stack direction="row" spacing={2} align="center" pt="3" justifyContent="center">
        <NavButton name="Home" path="/" />
        <NavButton name="Lists" path="packing-lists" />
        <NavButton name="Members" path="members" />
        <NavButton name="Categories" path="categories" />
        <NavButton name="Profile" path="profile" />
      </Stack>
    </>
  );
}
