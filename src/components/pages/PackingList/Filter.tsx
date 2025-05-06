import { Menu, MenuButton, MenuDivider, MenuList, SmallCloseIcon, Text } from '@chakra-ui/icons';
import { Button, HStack, MenuItemOption, MenuOptionGroup, useBreakpointValue } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react'; // Added useRef
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
    getInitialState('filteredCategories', [])
  );
  const [filteredMembers, setFilteredMembers] = useState<string[]>(() => getInitialState('filteredMembers', []));
  const [filteredPackItemState, setFilteredPackItemState] = useState<string[]>(() =>
    getInitialState('filteredPackItemState', [])
  );

  const initialFilterCallDoneRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('filteredCategories', JSON.stringify(filteredCategories));
    localStorage.setItem('filteredMembers', JSON.stringify(filteredMembers));
    localStorage.setItem('filteredPackItemState', JSON.stringify(filteredPackItemState));
  }, [filteredCategories, filteredMembers, filteredPackItemState]);

  useEffect(() => {
    // This effect ensures onFilter is called with initial values from localStorage
    // while adhering to exhaustive-deps by including all dependencies.
    // The ref guard ensures the onFilter logic here only executes once.
    if (!initialFilterCallDoneRef.current) {
      onFilter(filteredCategories, filteredMembers, filteredPackItemState);
      initialFilterCallDoneRef.current = true;
    }
  }, [onFilter, filteredCategories, filteredMembers, filteredPackItemState]);

  const handleFilterChange = (value: string | string[], type: 'categories' | 'members' | 'packItemState') => {
    const newValues = Array.isArray(value) ? value : [value];
    let updatedCategories = filteredCategories;
    let updatedMembers = filteredMembers;
    let updatedPackItemState = filteredPackItemState;

    if (type === 'categories') {
      setFilteredCategories(newValues);
      updatedCategories = newValues;
    } else if (type === 'members') {
      setFilteredMembers(newValues);
      updatedMembers = newValues;
    } else if (type === 'packItemState') {
      setFilteredPackItemState(newValues);
      updatedPackItemState = newValues;
    }
    onFilter(updatedCategories, updatedMembers, updatedPackItemState);
  };

  function removeNamedEntityFilter(id: string) {
    if (filteredCategories.includes(id)) {
      const arr = filteredCategories.filter((f) => f !== id);
      onFilter(arr, filteredMembers, filteredPackItemState);
      setFilteredCategories(arr);
    } else if (filteredMembers.includes(id)) {
      const arr = filteredMembers.filter((f) => f !== id);
      onFilter(filteredCategories, arr, filteredPackItemState);
      setFilteredMembers(arr);
    } else if (filteredPackItemState.includes(id)) {
      // Explicitly check packItemState
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
            onChange={(value) => handleFilterChange(value, 'packItemState')}
            title="Pack Item state"
          >
            {[CHECKED_FILTER_STATE, UNCHECKED_FILTER_STATE].map((entity) => (
              <MenuItemOption key={entity} value={entity}>
                {entity}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuOptionGroup
            type="checkbox"
            value={filteredCategories}
            onChange={(value) => handleFilterChange(value, 'categories')}
            title="Categories"
          >
            {categories.map((entity) => (
              <MenuItemOption key={entity.id} value={entity.id}>
                {entity.name}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuOptionGroup
            type="checkbox"
            value={filteredMembers}
            onChange={(value) => handleFilterChange(value, 'members')}
            title="Members"
          >
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
