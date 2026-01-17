import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  HStack,
  Input,
  Spacer,
  Switch,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ErrorModal } from '~/components/shared/ErrorModal.tsx';
import { handleArrayError } from '~/components/shared/HandleArrayError.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useError } from '~/providers/ErrorContext.ts';
import { writeDb } from '~/services/database.ts';
import { reorderAndSave } from '~/services/reorderUtils.ts';
import { handleEnter } from '~/services/utils.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
import { PackItem } from '~/types/PackItem.ts';
import { NamedEntityRow } from './NamedEntityRow.tsx';

export function NamedEntities({
  namedEntities,
  dbAdd,
  dbUpdate,
  dbDelete,
  type,
}: {
  namedEntities: NamedEntity[];
  dbAdd: (name: string) => Promise<string>;
  dbUpdate: (toUpdate: NamedEntity[] | NamedEntity) => Promise<void>;
  dbDelete: (id: string, packingLists: NamedEntity[], deleteEvenIfUsed?: boolean) => Promise<void>;
  type: string;
}) {
  const [reordered, setReordered] = useState(namedEntities);
  const [allPackItems, setAllPackItems] = useState<PackItem[]>([]);
  const [sortByAlpha, setSortByAlpha] = useState(() => {
    const saved = localStorage.getItem(`${type}SortByAlpha`);
    return saved === 'true';
  });
  const isSavingRef = useRef(false);

  const sortedEntities = useMemo(() => {
    if (sortByAlpha) {
      return [...reordered].sort((a, b) => a.name.localeCompare(b.name, navigator.language));
    }
    return reordered;
  }, [reordered, sortByAlpha]);

  function toggleSortOrder() {
    const newValue = !sortByAlpha;
    setSortByAlpha(newValue);
    localStorage.setItem(`${type}SortByAlpha`, String(newValue));
  }

  useEffect(() => {
    if (!isSavingRef.current) {
      setReordered(namedEntities);
    }
  }, [namedEntities]);

  useEffect(() => {
    if (type === 'categories') {
      writeDb.getPackItemsForAllPackingLists().then(setAllPackItems);
    }
  }, [type]);

  function refreshPackItems() {
    writeDb.getPackItemsForAllPackingLists().then(setAllPackItems);
  }

  function getItemCount(categoryId: string): number {
    return allPackItems.filter((item) => item.category === categoryId).length;
  }

  const [newName, setNewName] = useState<string>('');
  const { setError } = useError();
  const packingLists = useDatabase().packingLists;
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { isOpen: isDragAlertOpen, onOpen: onDragAlertOpen, onClose: onDragAlertClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleteError, setDeleteError] = useState<string | string[]>('');
  const [deleteId, setDeleteId] = useState<string>('');

  function handleAdd() {
    (async () => {
      if (!namedEntities.find((t) => t.name === newName)) {
        await dbAdd(newName);
      }
    })().catch(setError);
    setNewName('');
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
  }

  function onEnter(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, handleAdd);
  }

  async function handleDelete(id: string) {
    try {
      await dbDelete(id, packingLists);
    } catch (e) {
      const error = handleArrayError(e as Error);
      setDeleteError(error);
      setDeleteId(id);
      onToggle();
    }
  }

  async function onDragEnd(result: DropResult) {
    isSavingRef.current = true;
    await reorderAndSave(result, dbUpdate, reordered, setReordered);
    setTimeout(() => {
      isSavingRef.current = false;
    }, 500);
  }

  function switchToRankSort() {
    setSortByAlpha(false);
    localStorage.setItem(`${type}SortByAlpha`, 'false');
    onDragAlertClose();
  }

  return (
    <Flex m="5">
      <Spacer />
      <Card maxWidth="400px">
        <CardBody>
          <HStack justify="flex-end" mb={2}>
            <Text fontSize="xs" color="gray.500">
              {sortByAlpha ? 'A-Z' : 'Rank'}
            </Text>
            <Switch size="sm" isChecked={sortByAlpha} onChange={toggleSortOrder} />
          </HStack>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <Box {...provided.droppableProps} ref={provided.innerRef}>
                  {sortedEntities.map((entity, index) => (
                    <Draggable key={entity.id} draggableId={entity.id} index={index} isDragDisabled={sortByAlpha}>
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            padding: '1px',
                          }}
                          bg={snapshot.isDragging ? 'gray.100' : ''}
                        >
                          <NamedEntityRow
                            namedEntity={entity}
                            onUpdate={dbUpdate}
                            onDelete={handleDelete}
                            type={type}
                            dragHandleProps={provided.dragHandleProps}
                            itemCount={type === 'categories' ? getItemCount(entity.id) : undefined}
                            onItemsMoved={refreshPackItems}
                            isDragDisabled={sortByAlpha}
                            onDragDisabledClick={onDragAlertOpen}
                            allNames={namedEntities.map((e) => e.name)}
                          />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
          <Flex mt="2" gap="3" align="center">
            <Input placeholder="Enter a name" value={newName} onChange={handleOnChange} onKeyDown={onEnter} />
            <Button onClick={handleAdd}>Add</Button>
          </Flex>
          <ErrorModal
            error={deleteError}
            isOpen={isOpen}
            onClose={onClose}
            onProceed={async () => await dbDelete(deleteId, packingLists, true)}
          />
          <AlertDialog isOpen={isDragAlertOpen} leastDestructiveRef={cancelRef} onClose={onDragAlertClose}>
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Drag disabled
                </AlertDialogHeader>
                <AlertDialogBody>Change sorting to Rank to use drag and drop.</AlertDialogBody>
                <AlertDialogFooter>
                  <Button ref={cancelRef} onClick={onDragAlertClose}>
                    Cancel
                  </Button>
                  <Button colorScheme="blue" onClick={switchToRankSort} ml={3}>
                    Switch to Rank
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </CardBody>
      </Card>
      <Spacer />
    </Flex>
  );
}
