import { SmallCloseIcon } from '@chakra-ui/icons';
import {
  Button,
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineFilter } from 'react-icons/ai';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { UNCATEGORIZED } from '~/services/utils.ts';
import { COLUMN_COLORS } from '~/types/Column.ts';

export const CHECKED_FILTER_STATE = '☑ Checked';
export const UNCHECKED_FILTER_STATE = '☐ Unchecked';
export const WITHOUT_MEMBERS_ID = '__WITHOUT_MEMBERS__';

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
  const members = [{ id: WITHOUT_MEMBERS_ID, name: 'Without members', rank: 0 }, ...membersInPackingList];

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
  }, [filteredCategories, filteredMembers, filteredPackItemState]);

  const handleTempFilterChange = (value: string, type: 'categories' | 'members' | 'packItemState') => {
    if (type === 'categories') {
      const newCategories = tempFilteredCategories.includes(value)
        ? tempFilteredCategories.filter((id) => id !== value)
        : [...tempFilteredCategories, value];
      setTempFilteredCategories(newCategories);
    } else if (type === 'members') {
      const newMembers = tempFilteredMembers.includes(value)
        ? tempFilteredMembers.filter((id) => id !== value)
        : [...tempFilteredMembers, value];
      setTempFilteredMembers(newMembers);
    } else if (type === 'packItemState') {
      const newStates = tempFilteredPackItemState.includes(value)
        ? tempFilteredPackItemState.filter((id) => id !== value)
        : [...tempFilteredPackItemState, value];
      setTempFilteredPackItemState(newStates);
    }
  };

  const applyFilters = () => {
    setFilteredCategories(tempFilteredCategories);
    setFilteredMembers(tempFilteredMembers);
    setFilteredPackItemState(tempFilteredPackItemState);
    onFilter(tempFilteredCategories, tempFilteredMembers, tempFilteredPackItemState);
    onClose();
  };

  const clearAllFilters = () => {
    setFilteredCategories([]);
    setFilteredMembers([]);
    setFilteredPackItemState([]);
    onFilter([], [], []);
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

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        scrollBehavior="inside"
        blockScrollOnMount={true}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent maxH="90vh" display="flex" flexDirection="column" mx={4} my="auto">
          <ModalHeader flexShrink={0}>Filter Items</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" flex={1}>
            <VStack spacing={6} align="stretch">
              <VStack align="stretch" spacing={3}>
                <Text fontWeight="bold">Pack Item State</Text>
                <Stack direction="row" flexWrap="wrap" justifyContent="flex-start">
                  <Button
                    onClick={() => handleTempFilterChange(CHECKED_FILTER_STATE, 'packItemState')}
                    m={1}
                    bg={tempFilteredPackItemState.includes(CHECKED_FILTER_STATE) ? COLUMN_COLORS[0] : ''}
                    borderColor={tempFilteredPackItemState.includes(CHECKED_FILTER_STATE) ? 'black' : COLUMN_COLORS[0]}
                    borderWidth={tempFilteredPackItemState.includes(CHECKED_FILTER_STATE) ? 2 : 4}
                    size="sm"
                  >
                    {CHECKED_FILTER_STATE}
                  </Button>
                  <Button
                    onClick={() => handleTempFilterChange(UNCHECKED_FILTER_STATE, 'packItemState')}
                    m={1}
                    bg={tempFilteredPackItemState.includes(UNCHECKED_FILTER_STATE) ? COLUMN_COLORS[1] : ''}
                    borderColor={
                      tempFilteredPackItemState.includes(UNCHECKED_FILTER_STATE) ? 'black' : COLUMN_COLORS[1]
                    }
                    borderWidth={tempFilteredPackItemState.includes(UNCHECKED_FILTER_STATE) ? 2 : 4}
                    size="sm"
                  >
                    {UNCHECKED_FILTER_STATE}
                  </Button>
                </Stack>
              </VStack>

              <Divider />

              <VStack align="stretch" spacing={3}>
                <Text fontWeight="bold">Categories</Text>
                <Stack direction="row" flexWrap="wrap" justifyContent="flex-start">
                  {categories.map((entity, index) => (
                    <Button
                      key={entity.id}
                      onClick={() => handleTempFilterChange(entity.id, 'categories')}
                      m={1}
                      bg={tempFilteredCategories.includes(entity.id) ? COLUMN_COLORS[index % COLUMN_COLORS.length] : ''}
                      borderColor={
                        tempFilteredCategories.includes(entity.id)
                          ? 'black'
                          : COLUMN_COLORS[index % COLUMN_COLORS.length]
                      }
                      borderWidth={tempFilteredCategories.includes(entity.id) ? 2 : 4}
                      size="sm"
                    >
                      {entity.name}
                    </Button>
                  ))}
                </Stack>
              </VStack>

              <Divider />

              <VStack align="stretch" spacing={3}>
                <Text fontWeight="bold">Members</Text>
                <Stack direction="row" flexWrap="wrap" justifyContent="flex-start">
                  {members.map((entity, index) => (
                    <Button
                      key={entity.id}
                      onClick={() => handleTempFilterChange(entity.id, 'members')}
                      m={1}
                      bg={tempFilteredMembers.includes(entity.id) ? COLUMN_COLORS[index % COLUMN_COLORS.length] : ''}
                      borderColor={
                        tempFilteredMembers.includes(entity.id) ? 'black' : COLUMN_COLORS[index % COLUMN_COLORS.length]
                      }
                      borderWidth={tempFilteredMembers.includes(entity.id) ? 2 : 4}
                      size="sm"
                    >
                      {entity.name}
                    </Button>
                  ))}
                </Stack>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter flexShrink={0}>
            <Stack direction="row" spacing={3}>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All
              </Button>
              <Button colorScheme="blue" onClick={applyFilters}>
                Done
              </Button>
            </Stack>
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
