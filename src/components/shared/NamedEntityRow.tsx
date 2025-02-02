import { ChangeEvent } from 'react';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { firebase } from '../../services/api.ts';
import { useError, useFirebase } from '../../services/contexts.ts';
import { Flex, IconButton, Image, Input, Link, Popover, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import { ArrowUpIcon, DeleteIcon } from '@chakra-ui/icons';

export default function NamedEntityRow({
  namedEntity,
  onUpdate,
  onDelete,
  type,
  selected,
  setSelected,
}: {
  namedEntity: NamedEntity;
  onUpdate: (namedEntity: NamedEntity) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  type: string;
  selected: boolean;
  setSelected: (selected: boolean) => void;
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

  const images = useFirebase().images;
  const image = images.find((t) => t.type === type && t.typeId === namedEntity.id);
  const imageUrl = image?.url;
  return (
    <Flex mt="2" gap="3" align="center" bg={selected ? 'gray.100' : ''} borderRadius="md" pl="3">
      <Popover trigger="hover">
        <PopoverTrigger>
          <Link onClick={() => setSelected(!selected)}>
            {imageUrl ? <Image src={imageUrl} w="30px" /> : <ArrowUpIcon />}
          </Link>
        </PopoverTrigger>
        {imageUrl && (
          <PopoverContent boxShadow="dark-lg" p="6" rounded="md" bg="white" m="3">
            <Image src={imageUrl} />
          </PopoverContent>
        )}
      </Popover>
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
