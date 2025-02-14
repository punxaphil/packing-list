import { Menu, MenuButton, MenuDivider, MenuList } from '@chakra-ui/icons';
import { Flex, Link, MenuItemOption, MenuOptionGroup } from '@chakra-ui/react';
import { useState } from 'react';
import { AiOutlineFilter } from 'react-icons/ai';
import { useFirebase } from '../../services/contexts.ts';

export function Filter({
  onFilter,
}: {
  onFilter: (filterCategories: string[], filterMembers: string[]) => void;
}) {
  let categories = useFirebase().categories;
  let members = useFirebase().members;
  const packItems = useFirebase().packItems;
  categories = categories.filter((c) => packItems.some((p) => p.category === c.id));
  members = members.filter((m) => packItems.some((p) => p.members?.some((t) => t.id === m.id)));
  categories = [{ id: '', name: 'Uncategorized' }, ...categories];
  members = [{ id: '', name: 'Without members' }, ...members];
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<string[]>([]);

  function onChangeCategories(filter: string | string[]) {
    const arr = Array.isArray(filter) ? filter : [filter];
    onFilter(arr, filteredMembers);
    setFilteredCategories(arr);
  }

  function onChangeMembers(filter: string | string[]) {
    const arr = Array.isArray(filter) ? filter : [filter];
    onFilter(filteredCategories, arr);
    setFilteredMembers(arr);
  }

  return (
    <Menu closeOnSelect={false}>
      <MenuButton as={Link} m="3">
        <Flex alignItems="center" gap="1">
          <AiOutlineFilter /> Filter {(!!filteredCategories.length || !!filteredMembers.length) && '*'}
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup type="checkbox" value={filteredCategories} onChange={onChangeCategories} title="Categories">
          {categories.map((entity) => (
            <MenuItemOption key={entity.id} value={entity.id}>
              {entity.name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
        <MenuDivider />
        <MenuOptionGroup type="checkbox" value={filteredMembers} onChange={onChangeMembers} title="Members">
          {members.map((entity) => (
            <MenuItemOption key={entity.id} value={entity.id}>
              {entity.name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
}
