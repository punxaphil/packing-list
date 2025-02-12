import { Avatar } from '@chakra-ui/react';
import { NavLink } from 'react-router';
import { useFirebase } from '../../services/contexts.ts';
import { useCurrentUser } from './Auth.tsx';
import { THEME_COLOR } from '../../App.tsx';

export function ProfileAvatar({ shouldNavigate = true, size }: { shouldNavigate?: boolean; size: string }) {
  const currentUser = useCurrentUser();
  const images = useFirebase().images;
  const profileImage = images.find((image) => image.type === 'profile');

  return (
    <NavLink to={shouldNavigate ? '/profile' : ''}>
      <Avatar
        size={size}
        bg={THEME_COLOR}
        name={currentUser?.email[0]?.toUpperCase()}
        src={profileImage?.url}
        borderColor={THEME_COLOR}
        showBorder={true}
      />
    </NavLink>
  );
}
