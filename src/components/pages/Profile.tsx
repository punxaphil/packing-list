import { DeleteIcon } from '@chakra-ui/icons';
import { Button, Card, CardBody, Flex, IconButton, Spacer, Stack, useDisclosure } from '@chakra-ui/react';
import { getAuth, signOut } from 'firebase/auth';
import { useCurrentUser } from '~/components/auth/Auth.tsx';
import { ProfileAvatar } from '~/components/auth/ProfileAvatar.tsx';
import { UploadModal } from '~/components/shared/UploadModal.tsx';
import { useError } from '~/providers/ErrorContext.ts';
import { useFirebase } from '~/providers/FirebaseContext.ts';
import { firebase } from '~/services/firebase.ts';
import { getProfileImage } from '~/services/utils.ts';

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
            <Stack gap="2">
              <Button onClick={onOpen}>{profileImage ? 'Change' : 'Add'} profile picture</Button>
              <Button onClick={handleLogout} colorScheme="gray">
                Logout
              </Button>
            </Stack>
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
