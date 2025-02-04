import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { useError } from '../../services/contexts';
import { Button, Card, CardBody, Flex, Input, Spacer } from '@chakra-ui/react';
import { NamedEntity } from '../../types/NamedEntity.ts';
import NamedEntityRow from './NamedEntityRow.tsx';
import DragAndDrop from './DragAndDrop.tsx';

export default function NamedEntities({
  namedEntities,
  onAdd,
  onUpdate,
  onDelete,
  type,
}: {
  namedEntities: NamedEntity[];
  onAdd: (name: string) => Promise<void>;
  onUpdate: (namedEntity: NamedEntity) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  type: string;
}) {
  const [newName, setNewName] = useState<string>('');
  const { setError } = useError();

  function handleAdd() {
    (async function () {
      if (!namedEntities.find((t) => t.name === newName)) {
        await onAdd(newName);
      }
    })().catch(setError);
    setNewName('');
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
  }

  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleAdd();
    }
  }

  async function onEntitiesUpdated(updated: NamedEntity[]) {
    for (const entity of updated) {
      await onUpdate(entity);
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
            renderEntity={(entity, isDragging) => (
              <NamedEntityRow
                namedEntity={entity}
                onUpdate={onUpdate}
                onDelete={onDelete}
                type={type}
                isDragging={isDragging}
              />
            )}
          />
          <Flex mt="2" gap="3" align="center">
            <Input placeholder="Enter a name" value={newName} onChange={handleOnChange} onKeyDown={handleEnter} />
            <Button onClick={handleAdd}>Add</Button>
          </Flex>
        </CardBody>
      </Card>
      <Spacer />
    </Flex>
  );
}
