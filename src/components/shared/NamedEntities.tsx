import { Box, Button, Card, CardBody, Flex, Input, Spacer, useDisclosure } from '@chakra-ui/react';
import { DragDropContext, DragUpdate, Draggable, Droppable } from '@hello-pangea/dnd';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { handleEnter } from '../../services/utils.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { useError } from '../providers/ErrorContext.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { ErrorModal } from './ErrorModal.tsx';
import { handleArrayError } from './HandleArrayError.tsx';
import { NamedEntityRow } from './NamedEntityRow.tsx';

export function NamedEntities({
  namedEntities,
  onAdd,
  onUpdate,
  onDelete,
  type,
}: {
  namedEntities: NamedEntity[];
  onAdd: (name: string) => Promise<string>;
  onUpdate: (toUpdate: NamedEntity[] | NamedEntity) => Promise<void>;
  onDelete: (id: string, packingLists: NamedEntity[], deleteEvenIfUsed?: boolean) => Promise<void>;
  type: string;
}) {
  const [reordered, setReordered] = useState(namedEntities);
  const [newName, setNewName] = useState<string>('');
  const { setError } = useError();
  const packingLists = useFirebase().packingLists;
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [deleteError, setDeleteError] = useState<string | string[]>('');
  const [deleteId, setDeleteId] = useState<string>('');

  async function onDragEnd(result: DragUpdate) {
    if (!result.destination) {
      return;
    }
    const updated = reorder(result.source.index, result.destination.index);
    updated.forEach((entity, index) => {
      entity.rank = updated.length - index;
    });
    await onUpdate(updated);
    setReordered(updated);
  }

  function reorder(startIndex: number, endIndex: number) {
    const result = [...namedEntities];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  function handleAdd() {
    (async () => {
      if (!namedEntities.find((t) => t.name === newName)) {
        await onAdd(newName);
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
      await onDelete(id, packingLists);
    } catch (e) {
      const error = handleArrayError(e as Error);
      setDeleteError(error);
      setDeleteId(id);
      onToggle();
    }
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
                      {(provided, snapshot) => {
                        return (
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
                              onUpdate={onUpdate}
                              onDelete={handleDelete}
                              type={type}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </Box>
                        );
                      }}
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
            onProceed={async () => await onDelete(deleteId, packingLists, true)}
          />
        </CardBody>
      </Card>
      <Spacer />
    </Flex>
  );
}
