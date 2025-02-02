import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { useError } from '../../services/contexts';
import { Box, Button, Card, CardBody, Flex, Input } from '@chakra-ui/react';
import { NamedEntity } from '../../types/NamedEntity.ts';
import NamedEntityRow from './NamedEntityRow.tsx';
import { Upload } from './Upload.tsx';

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
  const [selectedRow, setSelectedRow] = useState<NamedEntity | undefined>(undefined);

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

  return (
    <Box m="5" maxWidth="400px">
      <Card>
        <CardBody>
          {namedEntities.map((item, index) => (
            <NamedEntityRow
              namedEntity={item}
              key={index}
              onUpdate={onUpdate}
              onDelete={onDelete}
              type={type}
              selected={item === selectedRow}
              setSelected={(selected: boolean) => setSelectedRow(selected ? item : undefined)}
            />
          ))}
          <Flex mt="2" gap="3" align="center">
            <Input size="2" placeholder="name" value={newName} onChange={handleOnChange} onKeyDown={handleEnter} />
            <Button onClick={handleAdd}>Add</Button>
          </Flex>
        </CardBody>
      </Card>
      {selectedRow && <Upload type={type} namedEntity={selectedRow} done={() => setSelectedRow(undefined)} />}
    </Box>
  );
}
