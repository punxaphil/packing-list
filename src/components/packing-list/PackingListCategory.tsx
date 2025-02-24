import { Flex, IconButton, Image, Text } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useState } from 'react';
import { TbCategoryPlus } from 'react-icons/tb';
import { firebase } from '../../services/firebase.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { DragHandle } from '../shared/DragHandle.tsx';
import { PLInput } from '../shared/PLInput.tsx';
import { NewPackItemRow } from './NewPackItemRow.tsx';

export function PackingListCategory({
  category,
  dragHandleProps,
  onFocus,
  sx,
}: {
  category: NamedEntity;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onFocus?: () => void;
  sx?: SystemStyleObject;
}) {
  const images = useFirebase().images;
  const [addNewPackItem, setAddNewPackItem] = useState(false);
  const [hideIcon, setHideIcon] = useState(false);

  async function onChangeCategory(name: string) {
    setHideIcon(false);
    category.name = name;
    await firebase.updateCategories(category);
  }

  function getCategoryImage() {
    if (category.id) {
      const image = images.find((t) => t.type === 'categories' && t.typeId === category.id);
      return image?.url;
    }
  }

  const categoryImage = getCategoryImage();
  return (
    <>
      <Flex gap="1" alignItems="center" borderTopRadius="2xl" pt="1" sx={sx} px="2" h="32px">
        <DragHandle dragHandleProps={dragHandleProps} />
        {categoryImage && <Image borderRadius="full" boxSize="30px" src={categoryImage} mr="2" />}
        {category.id ? (
          <PLInput
            bold={true}
            value={category.name}
            onUpdate={onChangeCategory}
            onFocus={() => {
              setHideIcon(true);
              onFocus?.();
            }}
          />
        ) : (
          <Text as="i" fontSize="sm" color="gray.500">
            Uncategorized
          </Text>
        )}
        {!hideIcon && (
          <IconButton
            aria-label="Add new pack item to category"
            icon={<TbCategoryPlus />}
            onClick={() => setAddNewPackItem(true)}
            size="sm"
            variant="ghost"
            ml="1"
          />
        )}
      </Flex>
      {addNewPackItem && <NewPackItemRow categoryId={category.id} onHide={() => setAddNewPackItem(false)} />}
    </>
  );
}
