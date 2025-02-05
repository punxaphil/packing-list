import { Avatar } from '@chakra-ui/react';
import { useCurrentUser } from './Auth.tsx';
import { NavLink } from 'react-router';
import { useFirebase } from '../../services/contexts.ts';

export function ProfileAvatar({ shouldNavigate = true, size }: { shouldNavigate?: boolean; size: string }) {
  const currentUser = useCurrentUser();
  const images = useFirebase().images;
  const profileImage = images.find((image) => image.type === 'profile');

  return (
    <NavLink to={shouldNavigate ? '/profile' : ''}>
      <Avatar
        size={size}
        bg="teal"
        name={currentUser?.email[0]?.toUpperCase()}
        src={profileImage?.url}
        borderColor="teal"
        showBorder={true}
      />
    </NavLink>
  );
}
