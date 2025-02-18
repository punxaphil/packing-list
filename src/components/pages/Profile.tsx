import { DeleteIcon } from '@chakra-ui/icons';
import { Button, ButtonGroup, Card, CardBody, Flex, IconButton, Spacer, useDisclosure } from '@chakra-ui/react';
import { getAuth, signOut } from 'firebase/auth';
import { firebase } from '../../services/firebase.ts';
import { getProfileImage } from '../../services/utils.ts';
import { useCurrentUser } from '../auth/Auth.tsx';
import { ProfileAvatar } from '../auth/ProfileAvatar.tsx';
import { useError } from '../providers/ErrorContext.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { UploadModal } from '../shared/UploadModal.tsx';

export function Profile() {
  const images = useFirebase().images;
  const profileImage = getProfileImage(images);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { setError } = useError();
  const currentUser = useCurrentUser();

  function handleLogout() {
    signOut(getAuth()).catch(setError);
  }

  function onDelete() {
    (async () => {
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
              <>
                <ProfileAvatar shouldNavigate={false} size={profileImage ? 'full' : '2xl'} />
                {profileImage && (
                  <IconButton size="xs" icon={<DeleteIcon />} aria-label="Delete profile picture" onClick={onDelete} />
                )}
              </>
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
