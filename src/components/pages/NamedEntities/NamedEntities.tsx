import { Box, Button, Card, CardBody, Flex, Input, Spacer, useDisclosure } from '@chakra-ui/react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ErrorModal } from '~/components/shared/ErrorModal.tsx';
import { handleArrayError } from '~/components/shared/HandleArrayError.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useError } from '~/providers/ErrorContext.ts';
import { reorderAndSave } from '~/services/reorderUtils.ts';
import { handleEnter } from '~/services/utils.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';
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
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!isSavingRef.current) {
      setReordered(namedEntities);
    }
  }, [namedEntities]);

  const [newName, setNewName] = useState<string>('');
  const { setError } = useError();
  const packingLists = useDatabase().packingLists;
  const { isOpen, onToggle, onClose } = useDisclosure();
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

  return (
    <Flex m="5">
      <Spacer />
      <Card maxWidth="400px">
        <CardBody>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <Box {...provided.droppableProps} ref={provided.innerRef}>
                  {reordered.map((entity, index) => (
                    <Draggable key={entity.id} draggableId={entity.id} index={index}>
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
        </CardBody>
      </Card>
      <Spacer />
    </Flex>
  );
}
