import { ArrowUpIcon, DragHandleIcon } from '@chakra-ui/icons';
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
import { AiOutlineDelete } from '@react-icons/all-files/ai/AiOutlineDelete';
import { ChangeEvent } from 'react';
import { useError, useFirebase } from '../../services/contexts.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
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
  const { setError } = useError();
  const { isOpen, onOpen, onClose } = useDisclosure();

  function changeName(event: ChangeEvent<HTMLInputElement>) {
    (async () => {
      if (namedEntity.name !== event.target.value) {
        namedEntity.name = event.target.value;
        await onUpdate(namedEntity);
      }
    })().catch(setError);
  }

  function handleDelete() {
    (async () => {
      await onDelete(namedEntity.id);
    })().catch(setError);
  }

  const images = useFirebase().images;
  const image = images.find((t) => t.type === type && t.typeId === namedEntity.id);
  const imageUrl = image?.url;
  return (
    <Box border={isDragging ? '1px solid black' : 'none'} borderRadius="md" bg={isDragging ? 'gray.200' : ''}>
      <Flex gap="3" align="center">
        <DragHandleIcon color="gray" />
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
          icon={<AiOutlineDelete />}
          aria-label="Delete"
        />
      </Flex>
      <UploadModal
        type={type}
        name={namedEntity.name}
        typeId={namedEntity.id}
        imageFinder={(t) => t.type === type && t.typeId === namedEntity.id}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
}
