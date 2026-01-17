import {
  Box,
  Flex,
  Image,
  Input,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { ChangeEvent, FocusEvent, useState } from 'react';
import { AiOutlineCloudUpload, AiOutlineDelete, AiOutlineSwap } from 'react-icons/ai';
import { MoveCategoryItemsModal } from '~/components/pages/NamedEntities/MoveCategoryItemsModal.tsx';
import { DeleteDialog } from '~/components/shared/DeleteDialog.tsx';
import { DragHandle } from '~/components/shared/DragHandle.tsx';
import { PLIconButton } from '~/components/shared/PLIconButton.tsx';
import { UploadModal } from '~/components/shared/UploadModal.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { useError } from '~/providers/ErrorContext.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';

export function NamedEntityRow({
  namedEntity,
  onUpdate,
  onDelete,
  type,
  dragHandleProps,
  itemCount,
  onItemsMoved,
  isDragDisabled,
  onDragDisabledClick,
  allNames,
}: {
  namedEntity: NamedEntity;
  onUpdate: (namedEntity: NamedEntity) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  type: string;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  itemCount?: number;
  onItemsMoved?: () => void;
  isDragDisabled?: boolean;
  onDragDisabledClick?: () => void;
  allNames: string[];
}) {
  const { setError } = useError();
  const toast = useToast();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isMoveOpen, onOpen: onMoveOpen, onClose: onMoveClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const isCategory = type === 'categories';
  const [localName, setLocalName] = useState(namedEntity.name);

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setLocalName(event.target.value);
  }

  function handleNameBlur(event: FocusEvent<HTMLInputElement>) {
    const newName = event.target.value;
    const isDuplicate = allNames.some((name) => name === newName && name !== namedEntity.name);
    if (isDuplicate) {
      toast({
        title: 'Name already exists',
        description: `"${newName}" is already used.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      setLocalName(namedEntity.name);
      return;
    }
    if (newName === namedEntity.name) {
      return;
    }
    (async () => {
      namedEntity.name = newName;
      await onUpdate(namedEntity);
    })().catch(setError);
  }

  function handleDelete() {
    (async () => {
      await onDelete(namedEntity.id);
    })().catch(setError);
  }

  const { images } = useDatabase();
  const image = images.find((t) => t.type === type && t.typeId === namedEntity.id);
  const imageUrl = image?.url;
  return (
    <Box>
      <Flex gap="3" align="center">
        <DragHandle
          dragHandleProps={dragHandleProps}
          disabled={isDragDisabled}
          onDisabledMouseDown={onDragDisabledClick}
        />
        <Popover trigger="hover">
          <PopoverTrigger>
            <Link onClick={onUploadOpen}>
              {imageUrl ? <Image src={imageUrl} w="30px" /> : <AiOutlineCloudUpload />}
            </Link>
          </PopoverTrigger>
          {imageUrl && (
            <PopoverContent boxShadow="dark-lg" p="6" rounded="md" bg="white" m="3">
              <Image src={imageUrl} />
            </PopoverContent>
          )}
        </Popover>
        <Input placeholder="name" value={localName} onChange={handleNameChange} onBlur={handleNameBlur} />
        {isCategory && (
          <Text fontSize="sm" color="gray.500" minW="30px" textAlign="center">
            {itemCount ?? 0}
          </Text>
        )}
        {isCategory && (
          <PLIconButton
            borderRadius="full"
            onClick={onMoveOpen}
            size="sm"
            icon={<AiOutlineSwap />}
            aria-label="Move items to another category"
          />
        )}
        <PLIconButton
          borderRadius="full"
          onClick={isCategory ? onDeleteOpen : handleDelete}
          size="sm"
          icon={<AiOutlineDelete />}
          aria-label="Delete"
        />
      </Flex>
      <UploadModal
        type={type}
        name={namedEntity.name}
        typeId={namedEntity.id}
        imageFinder={(t) => t.type === type && t.typeId === namedEntity.id}
        isOpen={isUploadOpen}
        onClose={onUploadClose}
      />
      {isCategory && (
        <MoveCategoryItemsModal
          isOpen={isMoveOpen}
          onClose={onMoveClose}
          sourceCategory={namedEntity}
          onItemsMoved={onItemsMoved}
        />
      )}
      {isCategory && (
        <DeleteDialog
          text={`category "${namedEntity.name}"`}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          onConfirm={handleDelete}
        />
      )}
    </Box>
  );
}
