import { Menu, MenuButton, MenuDivider, MenuList, SmallCloseIcon, Text } from '@chakra-ui/icons';
import { Button, HStack, MenuItemOption, MenuOptionGroup, useBreakpointValue } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { AiOutlineFilter } from 'react-icons/ai';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { UNCATEGORIZED } from '~/services/utils.ts';
import { COLUMN_COLORS } from '~/types/Column.ts';

export const CHECKED_FILTER_STATE = '☑ Checked';
export const UNCHECKED_FILTER_STATE = '☐ Unchecked';

// Helper function moved outside the component to avoid TSX parsing ambiguity with generics
function getInitialState<T>(key: string, defaultValue: T): T {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved) as T;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
    }
  }
  return defaultValue;
}

export function Filter({
  onFilter,
}: {
  onFilter: (filterCategories: string[], filterMembers: string[], filterPackItemState: string[]) => void;
}) {
  const { categoriesInPackingList, membersInPackingList } = useDatabase();
  const categories = [UNCATEGORIZED, ...categoriesInPackingList];
  const members = [{ id: '', name: 'Without members', rank: 0 }, ...membersInPackingList];

  const [filteredCategories, setFilteredCategories] = useState<string[]>(() =>
    getInitialState('filteredCategories', []),
  );
  const [filteredMembers, setFilteredMembers] = useState<string[]>(() => getInitialState('filteredMembers', []));
  const [filteredPackItemState, setFilteredPackItemState] = useState<string[]>(() =>
    getInitialState('filteredPackItemState', []),
  );

  useEffect(() => {
    localStorage.setItem('filteredCategories', JSON.stringify(filteredCategories));
  }, [filteredCategories]);

  useEffect(() => {
    localStorage.setItem('filteredMembers', JSON.stringify(filteredMembers));
  }, [filteredMembers]);

  useEffect(() => {
    localStorage.setItem('filteredPackItemState', JSON.stringify(filteredPackItemState));
  }, [filteredPackItemState]);

  useEffect(() => {
    // Apply filters on initial load
    onFilter(filteredCategories, filteredMembers, filteredPackItemState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies are intentionally omitted to run only once on mount with initial localStorage values.

  function onChangeCategories(filter: string | string[]) {
    const arr = Array.isArray(filter) ? filter : [filter];
    onFilter(arr, filteredMembers, filteredPackItemState);
    setFilteredCategories(arr);
  }

  function onChangeMembers(filter: string | string[]) {
    const arr = Array.isArray(filter) ? filter : [filter];
    onFilter(filteredCategories, arr, filteredPackItemState);
    setFilteredMembers(arr);
  }

  function onChangePackItemState(filter: string | string[]) {
    const arr = Array.isArray(filter) ? filter : [filter];
    onFilter(filteredCategories, filteredMembers, arr);
    setFilteredPackItemState(arr);
  }

  function removeNamedEntityFilter(id: string) {
    if (filteredCategories.includes(id)) {
      const arr = filteredCategories.filter((f) => f !== id);
      onFilter(arr, filteredMembers, filteredPackItemState);
      setFilteredCategories(arr);
    } else if (filteredMembers.includes(id)) {
      const arr = filteredMembers.filter((f) => f !== id);
      onFilter(filteredCategories, arr, filteredPackItemState);
      setFilteredMembers(arr);
    } else {
      const arr = filteredPackItemState.filter((f) => f !== id);
      onFilter(filteredCategories, filteredMembers, arr);
      setFilteredPackItemState(arr);
    }
  }
  const showFilterButtons = useBreakpointValue({ base: false, lg: true });
  const filterButtonsData = [
    ...filteredCategories.map((c) => categories.find((e) => e.id === c)),
    ...filteredMembers.map((m) => members.find((e) => e.id === m)),
    ...filteredPackItemState.map((c) => ({ id: c, name: c })),
  ].filter((e) => !!e);

  return (
    <HStack ml="3" spacing={0} alignItems="center">
      <Menu>
        <MenuButton>
          <HStack gap={0}>
            <AiOutlineFilter />
            <Text fontSize="2xs">
              {!showFilterButtons && filterButtonsData.length > 0 && `${filterButtonsData.length}*`}
            </Text>
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuOptionGroup
            type="checkbox"
            value={filteredPackItemState}
            onChange={onChangePackItemState}
            title="Pack Item state"
          >
            {[CHECKED_FILTER_STATE, UNCHECKED_FILTER_STATE].map((entity) => (
              <MenuItemOption key={entity} value={entity}>
                {entity}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
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
      {showFilterButtons &&
        filterButtonsData.map((c, index) => (
          <Button
            key={c?.id || index}
            onClick={() => removeNamedEntityFilter(c?.id)}
            rightIcon={<SmallCloseIcon />}
            size="xs"
            m="1"
            borderRadius="full"
            bg={COLUMN_COLORS[index % COLUMN_COLORS.length]}
          >
            {c?.name}
          </Button>
        ))}
    </HStack>
  );
}
