import { CheckIcon, PopoverCloseButton, SmallCloseIcon } from '@chakra-ui/icons';
import { Button, ButtonGroup, Popover, PopoverContent, PopoverTrigger, Text, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { firebase } from '../../services/firebase.ts';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { PLIconButton } from './PLIconButton.tsx';

interface ColorPickerProps {
  category: NamedEntity;
}

export function ColorPicker({ category }: ColorPickerProps) {
  const [color, setColor] = useState(category.color || undefined);
  const { onOpen, onClose, isOpen } = useDisclosure();

  async function saveColor() {
    onClose();
    category.color = color;
    await firebase.updateCategories(category);
  }

  async function resetColor() {
    onClose();
    category.color = '';
    await firebase.updateCategories(category);
  }

  return (
    <Popover onClose={onClose} isOpen={isOpen}>
      <PopoverTrigger>
        <PLIconButton onClick={onOpen} aria-label="Set category color" icon={<IoColorPaletteOutline />} />
      </PopoverTrigger>
      <PopoverContent boxShadow="dark-lg" rounded="2xl" p="3" alignItems="center">
        <PopoverCloseButton />
        <HexColorPicker color={color} onChange={setColor} />
        <Text mt="1">
          <Text as="b">Selected color: </Text>
          {color ?? 'No color selected'}
        </Text>
        <ButtonGroup>
          <Button onClick={saveColor} m="3" leftIcon={<CheckIcon />} colorScheme="green">
            Save
          </Button>
          <Button onClick={resetColor} m="3" leftIcon={<SmallCloseIcon />}>
            Reset
          </Button>
        </ButtonGroup>
      </PopoverContent>
    </Popover>
  );
}
