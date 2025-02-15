import { AttachmentIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Button,
  ButtonGroup,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Switch,
} from '@chakra-ui/react';
import { ChangeEvent, useState } from 'react';
import { firebase } from '../../services/firebase.ts';
import { cropImage, resizeImageFromFile } from '../../services/imageUtils.ts';
import { Image } from '../../types/Image.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';

export function UploadModal({
  type,
  typeId,
  name,
  isOpen,
  onClose,
  imageFinder,
}: {
  type: string;
  typeId: string;
  name: string;
  isOpen: boolean;
  onClose: () => void;
  imageFinder: (image: Image) => boolean;
}) {
  const images = useFirebase().images;
  const entityImage = images.find(imageFinder);
  const [fileUrl, setFileUrl] = useState(entityImage?.url);
  const [pasteImage, setPasteImage] = useState(false);

  async function resizeCropAndSet(file: File) {
    let result = await resizeImageFromFile(400, file);
    result = await cropImage(result, 1);
    if (result) {
      setFileUrl(result);
    }
  }

  async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) {
      await resizeCropAndSet(file);
    }
  }

  async function handleUpload() {
    if (fileUrl) {
      if (entityImage) {
        await firebase.updateImage(typeId, fileUrl);
      } else {
        await firebase.addImage(type, typeId, fileUrl);
      }
    }
    onClose();
  }

  async function handleDelete() {
    if (entityImage) {
      await firebase.deleteImage(entityImage.id);
    }
    resetAndClose();
  }

  function onSwitch() {
    return setPasteImage(!pasteImage);
  }

  async function onPaste() {
    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (/^image\//.test(type)) {
          const blob = await clipboardItem.getType(type);
          const file = new File([blob], 'pasted-image', { type });
          if (file) {
            await resizeCropAndSet(file);
          }
          return;
        }
      }
    }
  }

  function resetAndClose() {
    setFileUrl(undefined);
    onClose();
  }

  return (
    <>
      <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set image - {name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack m="5" spacing={4} align="center">
              <Switch onChange={onSwitch} isChecked={pasteImage} hidden={fileUrl !== undefined}>
                Paste image?
              </Switch>
              {pasteImage ? (
                <HStack>
                  <Input
                    placeholder="Paste image here"
                    onPaste={onPaste}
                    autoFocus
                    readOnly
                    width="200px"
                    height="200px"
                    hidden={fileUrl !== undefined}
                  />
                </HStack>
              ) : (
                <Input type="file" onChange={onFileSelected} accept="/image/*" p="1" hidden={fileUrl !== undefined} />
              )}
              {fileUrl && <img src={fileUrl} alt="firebase" />}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup>
              <Button onClick={handleUpload} colorScheme="blue" leftIcon={<AttachmentIcon />} isDisabled={!fileUrl}>
                Save
              </Button>
              <Button onClick={handleDelete} colorScheme="orange" leftIcon={<DeleteIcon />} isDisabled={!entityImage}>
                Remove
              </Button>
              <Button onClick={resetAndClose} colorScheme="gray" leftIcon={<CloseIcon />}>
                Cancel
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
