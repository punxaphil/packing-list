import { ChangeEvent, useState } from 'react';
import { firebase } from '../../services/api.ts';
import { cropImage, resizeImageFromFile, resizeImageFromUrl } from '../../services/imageUtils.ts';
import {
  Button,
  ButtonGroup,
  HStack,
  IconButton,
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
import { AttachmentIcon, RepeatIcon } from '@chakra-ui/icons';
import { useFirebase } from '../../services/contexts.ts';
import { Image } from '../../types/Image.ts';

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
  const [manualUrl, setManualUrl] = useState('');
  const [uploadFromUrl, setUploadFromUrl] = useState(false);

  function onManualUrlChange(event: ChangeEvent<HTMLInputElement>) {
    setManualUrl(event.target.value);
  }

  async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) {
      let result = await resizeImageFromFile(100, file);
      result = await cropImage(result, 1);
      if (result) {
        setFileUrl(result);
      }
    }
  }

  async function resizeAndCropManualURL() {
    if (manualUrl) {
      let result = await resizeImageFromUrl(100, manualUrl);
      result = await cropImage(result, 1);
      if (result) {
        setFileUrl(result);
      }
    }
  }

  async function handleUpload() {
    if (manualUrl !== fileUrl) {
      await resizeAndCropManualURL();
    }
    if (fileUrl) {
      if (entityImage) {
        await firebase.updateImage(typeId, fileUrl);
      } else {
        await firebase.addImage(type, type, fileUrl);
      }
    }
    onClose();
  }

  function onSwitch() {
    return setUploadFromUrl(!uploadFromUrl);
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
              <Switch colorScheme="blue" onChange={onSwitch} isChecked={uploadFromUrl}>
                Upload from URL?
              </Switch>
              {uploadFromUrl ? (
                <HStack>
                  <Input placeholder="URL of image to use" value={manualUrl} onChange={onManualUrlChange} />
                  <IconButton
                    aria-label="Add manual url"
                    icon={<RepeatIcon />}
                    onClick={resizeAndCropManualURL}
                    colorScheme="gray"
                  />
                </HStack>
              ) : (
                <Input type="file" onChange={onFileSelected} accept="/image/*" p="1" />
              )}
              {fileUrl && <img src={fileUrl} alt="firebase" />}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup>
              <Button onClick={handleUpload} colorScheme="blue" leftIcon={<AttachmentIcon />} isDisabled={!fileUrl}>
                Set image
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
