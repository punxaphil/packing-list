import { Avatar } from '@chakra-ui/react';
import { NavLink } from 'react-router';
import { THEME_COLOR } from '~/main.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { getProfileImage } from '~/services/utils.ts';
import { useCurrentUser } from './Auth.tsx';

export function ProfileAvatar({ shouldNavigate = true, size }: { shouldNavigate?: boolean; size: string }) {
  const currentUser = useCurrentUser();
  const images = useDatabase().images;
  const profileImage = getProfileImage(images);

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
