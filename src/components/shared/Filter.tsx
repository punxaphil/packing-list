import { Menu, MenuButton, MenuDivider, MenuList, SmallCloseIcon } from '@chakra-ui/icons';
import { Button, Link, MenuItemOption, MenuOptionGroup } from '@chakra-ui/react';
import { useState } from 'react';
import { AiOutlineFilter } from 'react-icons/ai';
import { UNCATEGORIZED } from '../../services/utils.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
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

  function removeFilter(filterToRemove: NamedEntity) {
    if (filteredCategories.includes(filterToRemove.id)) {
      const arr = filteredCategories.filter((f) => f !== filterToRemove.id);
      onFilter(arr, filteredMembers);
      setFilteredCategories(arr);
    } else {
      const arr = filteredMembers.filter((f) => f !== filterToRemove.id);
      onFilter(filteredCategories, arr);
      setFilteredMembers(arr);
    }
  }

  const allFilters = [
    ...filteredCategories.map((c) => usedCategories.find((e) => e.id === c)),
    ...filteredMembers.map((m) => usedMembers.find((e) => e.id === m)),
  ].filter((e) => !!e);
  return (
    <>
      <Menu>
        <MenuButton as={Link} m="3">
          <AiOutlineFilter />
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
      {allFilters.map((c) => (
        <Button
          key={c?.id}
          onClick={() => removeFilter(c)}
          rightIcon={<SmallCloseIcon />}
          size="xs"
          m="1"
          borderRadius="full"
        >
          {c?.name}
        </Button>
      ))}
    </>
  );
}
