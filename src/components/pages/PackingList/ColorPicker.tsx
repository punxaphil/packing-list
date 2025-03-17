import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';

export function ColorPicker({
  category,
  isOpen,
  onClose,
}: {
  category: NamedEntity;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [color, setColor] = useState(category.color || undefined);
  const toast = useToast();
  const { dbInvoke } = useDatabase();

  async function saveColor() {
    onClose();
    category.color = color;
    await dbInvoke.updateCategories(category);
    toast({
      title: 'Color saved!',
      status: 'success',
    });
  }

  async function resetColor() {
    onClose();
    category.color = '';
    await dbInvoke.updateCategories(category);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Set category color</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack alignItems="center">
            <HexColorPicker color={color} onChange={setColor} />
            <Text mt="1">{color ?? 'No color selected'}</Text>
            <ButtonGroup>
              <Button onClick={saveColor} m="3" colorScheme="green">
                Save
              </Button>
              <Button onClick={resetColor} m="3">
                Reset
              </Button>
            </ButtonGroup>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
