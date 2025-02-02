import { ChangeEvent, useState } from 'react';
import { firebase } from '../../services/api.ts';
import { cropImage, resizeImage } from '../../services/imageUtils.ts';
import { Button, HStack, IconButton, Input, Stack, Switch } from '@chakra-ui/react';
import { AttachmentIcon, CheckIcon } from '@chakra-ui/icons';
import { NamedEntity } from '../../types/NamedEntity.ts';
import { useFirebase } from '../../services/contexts.ts';

export function Upload({ type, namedEntity, done }: { type: string; namedEntity: NamedEntity; done: () => void }) {
  const [fileUrl, setFileUrl] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [uploadFromUrl, setUploadFromUrl] = useState(false);
  const images = useFirebase().images;
  const imageId = images.find((t) => t.type === type && t.typeId === namedEntity.id)?.id;

  function handleOnManualUrl(event: ChangeEvent<HTMLInputElement>) {
    setManualUrl(event.target.value);
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (file) {
      let result = await resizeImage(100, file);
      result = await cropImage(result, 1);
      if (result) {
        setFileUrl(result);
      }
    }
  }

  const handleUpload = async () => {
    if (fileUrl) {
      if (imageId) {
        await firebase.updateImage(imageId, fileUrl);
      } else {
        await firebase.addImage(type, namedEntity.id, fileUrl);
      }
    }
    done();
  };
  const onSwitch = () => setUploadFromUrl(!uploadFromUrl);

  return (
    <Stack m="5" spacing={4} align="center">
      <Switch colorScheme="blue" onChange={onSwitch} isChecked={uploadFromUrl}>
        Upload from URL?
      </Switch>
      {uploadFromUrl ? (
        <HStack>
          <Input placeholder="URL of image to use" value={manualUrl} onChange={handleOnManualUrl} />
          <IconButton aria-label="Add manual url" icon={<CheckIcon />} onClick={() => setFileUrl(manualUrl)} />
        </HStack>
      ) : (
        <Input type="file" onChange={handleChange} accept="/image/*" p="1" />
      )}
      <Button onClick={handleUpload} colorScheme="blue" leftIcon={<AttachmentIcon />} disabled={!fileUrl}>
        Add image to {namedEntity.name}
      </Button>
      {fileUrl && <img src={fileUrl} alt="firebase" />}
    </Stack>
  );
}
