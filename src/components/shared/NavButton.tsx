import { Button } from '@chakra-ui/react';
import { NavLink } from 'react-router';

export default function NavButton({ name, path }: { name: string; path: string }) {
  return (
    <NavLink to={path} end>
      {({ isActive }) => <Button variant={isActive ? undefined : 'soft'}>{name}</Button>}
    </NavLink>
  );
}
