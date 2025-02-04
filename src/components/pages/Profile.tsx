import { useError, useFirebase } from '../../services/contexts';
import { Button, Card, CardBody, Flex, Heading, Image, Spacer, useDisclosure } from '@chakra-ui/react';
import { UploadModal } from '../shared/UploadModal.tsx';
import { getAuth, signOut } from 'firebase/auth';
import { useCurrentUser } from '../auth/Auth.tsx';

export function Profile() {
  const images = useFirebase().images;
  const profileImage = images.find((image) => image.type === 'profile');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { setError } = useError();
  const currentUser = useCurrentUser();

  function handleLogout() {
    signOut(getAuth()).catch(setError);
  }

  return (
    <Flex m="5">
      <Spacer />
      <Card maxWidth="400px">
        <CardBody>
          <Flex gap="3" direction="column">
            <Heading as="h2">{currentUser.email}</Heading>
            <Flex>
              <Spacer />
              {profileImage && (
                <Image
                  src={profileImage.url}
                  alt="profile"
                  shadow="xl"
                  border="1px"
                  borderColor="gray"
                  borderRadius="full"
                />
              )}
              <Spacer />
            </Flex>
            <Spacer />
            <Button onClick={onOpen}>{profileImage ? 'Change' : 'Add'} profile picture</Button>
            <Button onClick={handleLogout} colorScheme="red">
              Logout
            </Button>
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
