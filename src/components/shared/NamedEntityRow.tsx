import { ChangeEvent } from 'react';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { firebase } from '../../services/api.ts';
import { useError, useFirebase } from '../../services/contexts.ts';
import {
  Box,
  Flex,
  IconButton,
  Image,
  Input,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowUpIcon, DeleteIcon, HamburgerIcon } from '@chakra-ui/icons';
import { UploadModal } from './UploadModal.tsx';

export function NamedEntityRow({
  namedEntity,
  onUpdate,
  onDelete,
  type,
  isDragging = false,
}: {
  namedEntity: NamedEntity;
  onUpdate: (namedEntity: NamedEntity) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  type: string;
  isDragging: boolean;
}) {
  const packItems = useFirebase().packItems;
  const { setError } = useError();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      for (const packItem of packItems) {
        if (packItem.category === namedEntity.id) {
          delete packItem.category;
          await firebase.updatePackItem(packItem);
        }
      }
      await onDelete(namedEntity.id);
    })().catch(setError);
  }

  const images = useFirebase().images;
  const image = images.find((t) => t.type === type && t.typeId === namedEntity.id);
  const imageUrl = image?.url;
  return (
    <Box border={isDragging ? '1px solid black' : 'none'} borderRadius="md" bg={isDragging ? 'gray.200' : ''}>
      <Flex gap="3" align="center">
        <HamburgerIcon color="gray" />
        <Popover trigger="hover">
          <PopoverTrigger>
            <Link onClick={onOpen}>{imageUrl ? <Image src={imageUrl} w="30px" /> : <ArrowUpIcon />}</Link>
          </PopoverTrigger>
          {imageUrl && (
            <PopoverContent boxShadow="dark-lg" p="6" rounded="md" bg="white" m="3">
              <Image src={imageUrl} />
            </PopoverContent>
          )}
        </Popover>
        <Input placeholder="name" value={namedEntity.name} onChange={changeName} />
        <IconButton
          borderRadius="full"
          onClick={handleDelete}
          variant="ghost"
          icon={<DeleteIcon />}
          aria-label="Delete"
        />
      </Flex>
      <UploadModal type={type} namedEntity={namedEntity} isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}
