import { Flex, HStack, IconButton, Input, Spacer, Stack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { GoArrowSwitch } from 'react-icons/go';
import { useNavigate } from 'react-router';
import { ProfileAvatar } from '~/components/auth/ProfileAvatar.tsx';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { writeDb } from '~/services/database.ts';
import { NavButton } from './NavButton.tsx';

export function Header() {
  const { packingList } = usePackingList();
  const [packingListName, setPackingListName] = useState('');
  const navigate = useNavigate();

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
        <Spacer />
        <Input
          key={packingList.id}
          value={packingListName}
          onChange={(e) => savePackingListName(e.target.value)}
          w="max-content"
          textAlign="center"
          fontSize={['xl', '4xl']}
          p={0}
          variant="unstyled"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        />
        <IconButton
          aria-label="Go to lists"
          icon={<GoArrowSwitch />}
          variant="ghost"
          onClick={() => navigate('/packing-lists')}
          size="sm"
        />
        <Spacer />

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
