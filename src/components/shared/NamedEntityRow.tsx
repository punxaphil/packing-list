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
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { ChangeEvent } from 'react';
import { AiOutlineCloudUpload, AiOutlineDelete } from 'react-icons/ai';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { useError } from '../providers/ErrorContext.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { DragHandle } from './DragHandle.tsx';
import { UploadModal } from './UploadModal.tsx';

export function NamedEntityRow({
  namedEntity,
  onUpdate,
  onDelete,
  type,
  dragHandleProps,
}: {
  namedEntity: NamedEntity;
  onUpdate: (namedEntity: NamedEntity) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  type: string;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
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
    <Box p="2">
      <Flex gap="3" align="center">
        <DragHandle dragHandleProps={dragHandleProps} />
        <Popover trigger="hover">
          <PopoverTrigger>
            <Link onClick={onOpen}>{imageUrl ? <Image src={imageUrl} w="30px" /> : <AiOutlineCloudUpload />}</Link>
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
