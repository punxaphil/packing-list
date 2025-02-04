import { Avatar, Tooltip } from '@chakra-ui/react';
import { useCurrentUser } from './Auth.tsx';
import { NavLink } from 'react-router';
import { useFirebase } from '../../services/contexts.ts';

export function ProfileAvatar() {
  const currentUser = useCurrentUser();
  const images = useFirebase().images;
  const profileImage = images.find((image) => image.type === 'profile');

  return (
    <Tooltip label={`Show profile page for ${currentUser.email}`}>
      <NavLink to="/profile">
        <Avatar size="md" bg="teal" name={currentUser?.email[0]?.toUpperCase()} src={profileImage?.url} />
      </NavLink>
    </Tooltip>
  );
}
