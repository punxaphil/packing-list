import { Badge, Flex, HStack, Input, Spacer, Stack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { ProfileAvatar } from '~/components/auth/ProfileAvatar.tsx';
import { usePackingList } from '~/providers/PackingListContext.ts';
import { useTemplate } from '~/providers/TemplateContext.ts';
import { writeDb } from '~/services/database.ts';
import { NavButton } from './NavButton.tsx';

export function Header() {
  const { packingList } = usePackingList();
  const { isTemplateList } = useTemplate();
  const [packingListName, setPackingListName] = useState('');
  const isCurrentListTemplate = isTemplateList(packingList.id);

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
        <HStack spacing={2}>
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
          {isCurrentListTemplate && (
            <Badge colorScheme="purple" fontSize="sm">
              Template
            </Badge>
          )}
        </HStack>
        <Spacer />

        <HStack w="50px" justifyContent="flex-end">
          <ProfileAvatar size="sm" />
        </HStack>
      </Flex>
      <Stack direction="row" spacing={2} align="center" pt="3" justifyContent="center">
        <NavButton name="Items" path="/" />
        <NavButton name="Lists" path="packing-lists" />
        <NavButton name="Members" path="members" />
        <NavButton name="Categories" path="categories" />
        <NavButton name="Profile" path="profile" />
      </Stack>
    </>
  );
}
