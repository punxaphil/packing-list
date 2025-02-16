import { Button, Card, CardBody, Flex, Input, Spacer, useToast } from '@chakra-ui/react';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { handleEnter } from '../../services/utils.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { useError } from '../providers/ErrorContext.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { DragAndDrop } from './DragAndDrop.tsx';
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
  onDelete: (id: string, packingLists: NamedEntity[]) => Promise<void>;
  type: string;
}) {
  const [newName, setNewName] = useState<string>('');
  const { setError } = useError();
  const toast = useToast();
  const packingLists = useFirebase().packingLists;

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

  async function onEntitiesUpdated(entities: NamedEntity[]) {
    await onUpdate(entities);
  }

  async function handleDelete(id: string) {
    try {
      await onDelete(id, packingLists);
    } catch (e) {
      handleArrayError(e as Error, toast);
    }
  }

  return (
    <Flex m="5">
      <Spacer />
      <Card maxWidth="400px">
        <CardBody>
          <DragAndDrop
            entities={namedEntities}
            onEntitiesUpdated={onEntitiesUpdated}
            renderEntity={(entity, dragHandle) => (
              <NamedEntityRow
                namedEntity={entity}
                onUpdate={onUpdate}
                onDelete={handleDelete}
                type={type}
                dragHandle={dragHandle}
              />
            )}
          />
          <Flex mt="2" gap="3" align="center">
            <Input placeholder="Enter a name" value={newName} onChange={handleOnChange} onKeyDown={onEnter} />
            <Button onClick={handleAdd}>Add</Button>
          </Flex>
        </CardBody>
      </Card>
      <Spacer />
    </Flex>
  );
}
