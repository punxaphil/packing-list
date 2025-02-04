import { useError, useFirebase } from '../../services/contexts';
import { Button, ButtonGroup, Card, CardBody, Flex, IconButton, Image, Spacer, useDisclosure } from '@chakra-ui/react';
import { UploadModal } from '../shared/UploadModal.tsx';
import { getAuth, signOut } from 'firebase/auth';
import { useCurrentUser } from '../auth/Auth.tsx';
import { DeleteIcon } from '@chakra-ui/icons';
import { firebase } from '../../services/api.ts';
import { ProfileAvatar } from '../auth/ProfileAvatar.tsx';

export function Profile() {
  const images = useFirebase().images;
  const profileImage = images.find((image) => image.type === 'profile');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { setError } = useError();
  const currentUser = useCurrentUser();

  function handleLogout() {
    signOut(getAuth()).catch(setError);
  }

  function onDelete() {
    (async function () {
      if (profileImage) {
        await firebase.deleteImage(profileImage.id);
      }
    })().catch(setError);
  }

  return (
    <Flex m="5">
      <Spacer />
      <Card maxWidth="600px">
        <CardBody>
          <Flex gap="3" direction="column" alignItems="center">
            {currentUser.email}
            <Flex alignItems="end">
              {profileImage ? (
                <>
                  <Image
                    src={profileImage.url}
                    alt="profile"
                    shadow="xl"
                    border="1px"
                    borderColor="gray"
                    borderRadius="full"
                  />
                  <IconButton size="xs" icon={<DeleteIcon />} aria-label="Delete profile picture" onClick={onDelete} />
                </>
              ) : (
                <ProfileAvatar shouldNavigate={false} size="xl" />
              )}
            </Flex>
            <Spacer />
            <ButtonGroup flexDirection="column" gap="2">
              <Button onClick={onOpen}>{profileImage ? 'Change' : 'Add'} profile picture</Button>
              <Button onClick={handleLogout} colorScheme="gray">
                Logout
              </Button>
            </ButtonGroup>
          </Flex>
          <UploadModal
            type="profile"
            typeId={profileImage?.id || ''}
            name="Profile"
            imageFinder={(image) => image.type === 'profile'}
            isOpen={isOpen}
            onClose={onClose}
          />
        </CardBody>
      </Card>
      <Spacer />
    </Flex>
  );
}
