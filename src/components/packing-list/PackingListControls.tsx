import { EditIcon, Menu, MenuButton, MenuList } from '@chakra-ui/icons';
import { Flex, Link, MenuItemOption, MenuOptionGroup, Spacer, Stack } from '@chakra-ui/react';
import { IoFilterOutline } from '@react-icons/all-files/io5/IoFilterOutline';
import { useState } from 'react';
import { useFirebase } from '../../services/contexts.ts';
import { PackItem } from '../../types/PackItem.ts';

export function PackingListControls({
  hidden,
  onClick,
  onFilterChanged,
}: {
  hidden: boolean;
  onClick: () => void;
  onFilterChanged: (prevState: PackItem[]) => void;
}) {
  const packItems = useFirebase().packItems;
  const categories = useFirebase().categories;
  const [filterCategories, setFilterCategories] = useState<string | string[]>(categories.map((c) => c.id));

  function filterOnCategories(filter: string | string[]) {
    const filterArray = Array.isArray(filter) ? filter : [filter];
    onFilterChanged(packItems.filter((packItem) => !packItem.category || filterArray.includes(packItem.category)));
    setFilterCategories(filter);
  }

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Menu closeOnSelect={false}>
        <MenuButton as={Link} m="3" color="teal.500" hidden={hidden}>
          <Flex alignItems="center" gap="1">
            <IoFilterOutline /> Filter categories {filterCategories.length < categories.length && '*'}
          </Flex>
        </MenuButton>
        <MenuList>
          <MenuOptionGroup type="checkbox" value={filterCategories} onChange={filterOnCategories}>
            {categories.map((category) => (
              <MenuItemOption key={category.id} value={category.id}>
                {category.name}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
      <Spacer />
      <Link color="teal.500" onClick={onClick} variant="outline" hidden={hidden} m="3">
        <EditIcon /> Text mode
      </Link>
    </Stack>
  );
}
