import { Menu, MenuButton, MenuDivider, MenuList } from '@chakra-ui/icons';
import { Flex, Link, MenuItemOption, MenuOptionGroup } from '@chakra-ui/react';
import { useState } from 'react';
import { AiOutlineFilter } from 'react-icons/ai';
import { UNCATEGORIZED } from '../../services/utils.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';

export function Filter({
  onFilter,
}: {
  onFilter: (filterCategories: string[], filterMembers: string[]) => void;
}) {
  let usedCategories = useFirebase().categories;
  let usedMembers = useFirebase().members;
  const packItems = useFirebase().packItems;
  usedCategories = usedCategories.filter((c) => packItems.some((p) => p.category === c.id));
  usedMembers = usedMembers.filter((m) => packItems.some((p) => p.members.some((t) => t.id === m.id)));
  usedCategories = [UNCATEGORIZED, ...usedCategories];
  usedMembers = [{ id: '', name: 'Without members', rank: 0 }, ...usedMembers];
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
    <Menu>
      <MenuButton as={Link} m="3">
        <Flex alignItems="center" gap="1">
          <AiOutlineFilter /> Filter {(!!filteredCategories.length || !!filteredMembers.length) && '*'}
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuOptionGroup type="checkbox" value={filteredCategories} onChange={onChangeCategories} title="Categories">
          {usedCategories.map((entity) => (
            <MenuItemOption key={entity.id} value={entity.id}>
              {entity.name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
        <MenuDivider />
        <MenuOptionGroup type="checkbox" value={filteredMembers} onChange={onChangeMembers} title="Members">
          {usedMembers.map((entity) => (
            <MenuItemOption key={entity.id} value={entity.id}>
              {entity.name}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
}
