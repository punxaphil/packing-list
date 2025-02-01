import { ChangeEvent } from 'react';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { firebase } from '../../services/api.ts';
import { useError, useFirebase } from '../../services/contexts.ts';
import { Flex, IconButton, Input } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

export default function NamedEntityRow({
  namedEntity,
  onUpdate,
  onDelete,
}: {
  namedEntity: NamedEntity;
  onUpdate: (namedEntity: NamedEntity) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const items = useFirebase().items;
  const { setError } = useError();

  function changeName(event: ChangeEvent<HTMLInputElement>) {
    (async function () {
      if (namedEntity.name !== event.target.value) {
        namedEntity.name = event.target.value;
        await onUpdate(namedEntity);
      }
    })().catch(setError);
  }

  function handleDelete() {
    (async function () {
      for (const item of items) {
        if (item.category === namedEntity.id) {
          delete item.category;
          await firebase.updateItem(item);
        }
      }
      await onDelete(namedEntity.id);
    })().catch(setError);
  }

  return (
    <Flex mt="2" gap="3" align="center">
      <Input size="2" placeholder="name" value={namedEntity.name} onChange={changeName} />
      <IconButton
        borderRadius="full"
        onClick={handleDelete}
        variant="ghost"
        icon={<DeleteIcon />}
        aria-label="Delete"
      />
    </Flex>
  );
}
