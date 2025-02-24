import { CheckIcon } from '@chakra-ui/icons';
import { Flex, IconButton, Image, Popover, PopoverContent, PopoverTrigger, useDisclosure } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/styled-system';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { IoColorPaletteOutline } from 'react-icons/io5';
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
  const [hideIcons, setHideIcons] = useState(false);
  const [color, setColor] = useState('#aabbcc');
  const { onOpen } = useDisclosure();

  async function onChangeCategory(name: string) {
    setHideIcons(false);
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

  async function saveColor() {
    category.color = color;
    await firebase.updateCategories(category);
  }

  return (
    <>
      <Flex gap="1" alignItems="center" borderTopRadius="2xl" pt="1" sx={sx} px="2" h="32px">
        {category.id && <DragHandle dragHandleProps={dragHandleProps} />}
        {categoryImage && <Image borderRadius="full" boxSize="30px" src={categoryImage} mr="2" />}
        <PLInput
          bold={true}
          value={category.name}
          onUpdate={onChangeCategory}
          onFocus={() => {
            setHideIcons(true);
            onFocus?.();
          }}
          disabled={!category.id}
        />
        {!hideIcons && (
          <>
            <IconButton
              aria-label="Add new pack item to category"
              icon={<TbCategoryPlus />}
              onClick={() => setAddNewPackItem(true)}
              size="sm"
              variant="ghost"
              ml="1"
            />
            {category.id && (
              <Popover trigger="hover">
                <PopoverTrigger>
                  <IconButton
                    onClick={onOpen}
                    aria-label="Set category color"
                    icon={<IoColorPaletteOutline />}
                    size="sm"
                    variant="ghost"
                  />
                </PopoverTrigger>
                <PopoverContent boxShadow="dark-lg" rounded="2xl" p="3" alignItems="center">
                  <HexColorPicker color={color} onChange={setColor} />
                  <IconButton
                    onClick={saveColor}
                    m="3"
                    colorScheme="gray"
                    icon={<CheckIcon />}
                    aria-label="Save color"
                  />
                </PopoverContent>
              </Popover>
            )}
          </>
        )}
      </Flex>
      {addNewPackItem && <NewPackItemRow categoryId={category.id} onHide={() => setAddNewPackItem(false)} />}
    </>
  );
}
