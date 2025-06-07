import { SmallCloseIcon } from '@chakra-ui/icons';
import {
  Button,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useBreakpointValue,
  Checkbox,
  CheckboxGroup,
  Stack,
  Divider,
  VStack
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
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
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const [tempFilteredCategories, setTempFilteredCategories] = useState<string[]>([]);
  const [tempFilteredMembers, setTempFilteredMembers] = useState<string[]>([]);
  const [tempFilteredPackItemState, setTempFilteredPackItemState] = useState<string[]>([]);

  const initialFilterCallDoneRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('filteredCategories', JSON.stringify(filteredCategories));
    localStorage.setItem('filteredMembers', JSON.stringify(filteredMembers));
    localStorage.setItem('filteredPackItemState', JSON.stringify(filteredPackItemState));
  }, [filteredCategories, filteredMembers, filteredPackItemState]);

  useEffect(() => {
    if (!initialFilterCallDoneRef.current) {
      onFilter(filteredCategories, filteredMembers, filteredPackItemState);
      initialFilterCallDoneRef.current = true;
    }
  }, [onFilter, filteredCategories, filteredMembers, filteredPackItemState]);

  useEffect(() => {
    setTempFilteredCategories(filteredCategories);
    setTempFilteredMembers(filteredMembers);
    setTempFilteredPackItemState(filteredPackItemState);
  }, [isOpen, filteredCategories, filteredMembers, filteredPackItemState]);

  const handleTempFilterChange = (value: string[], type: 'categories' | 'members' | 'packItemState') => {
    if (type === 'categories') {
      setTempFilteredCategories(value);
    } else if (type === 'members') {
      setTempFilteredMembers(value);
    } else if (type === 'packItemState') {
      setTempFilteredPackItemState(value);
    }
  };

  const applyFilters = () => {
    setFilteredCategories(tempFilteredCategories);
    setFilteredMembers(tempFilteredMembers);
    setFilteredPackItemState(tempFilteredPackItemState);
    onFilter(tempFilteredCategories, tempFilteredMembers, tempFilteredPackItemState);
    onClose();
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
      <Button onClick={onOpen} size="sm" variant="ghost">
        <HStack gap={0}>
          <AiOutlineFilter />
          <Text fontSize="2xs">
            {!showFilterButtons && filterButtonsData.length > 0 && `${filterButtonsData.length}*`}
          </Text>
        </HStack>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Filter Items</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <VStack align="stretch" spacing={3}>
                <Text fontWeight="bold">Pack Item State</Text>
                <CheckboxGroup
                  value={tempFilteredPackItemState}
                  onChange={(value) => handleTempFilterChange(value as string[], 'packItemState')}
                >
                  <Stack direction="column">
                    <Checkbox value={CHECKED_FILTER_STATE}>{CHECKED_FILTER_STATE}</Checkbox>
                    <Checkbox value={UNCHECKED_FILTER_STATE}>{UNCHECKED_FILTER_STATE}</Checkbox>
                  </Stack>
                </CheckboxGroup>
              </VStack>

              <Divider />

              <VStack align="stretch" spacing={3}>
                <Text fontWeight="bold">Categories</Text>
                <CheckboxGroup
                  value={tempFilteredCategories}
                  onChange={(value) => handleTempFilterChange(value as string[], 'categories')}
                >
                  <Stack direction="column">
                    {categories.map((entity) => (
                      <Checkbox key={entity.id} value={entity.id}>
                        {entity.name}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </VStack>

              <Divider />

              <VStack align="stretch" spacing={3}>
                <Text fontWeight="bold">Members</Text>
                <CheckboxGroup
                  value={tempFilteredMembers}
                  onChange={(value) => handleTempFilterChange(value as string[], 'members')}
                >
                  <Stack direction="column">
                    {members.map((entity) => (
                      <Checkbox key={entity.id} value={entity.id}>
                        {entity.name}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={applyFilters}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
