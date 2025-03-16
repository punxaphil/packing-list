import { Icon, Menu, MenuButton, MenuGroup, MenuList } from '@chakra-ui/icons';
import { ReactNode } from 'react';
import { BsThreeDots } from 'react-icons/bs';

export function ContextMenu({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Menu>
      <MenuButton>
        <Icon as={BsThreeDots} color="gray.300" mx={2} />
      </MenuButton>
      <MenuList>
        <MenuGroup title={title}>{children}</MenuGroup>
      </MenuList>
    </Menu>
  );
}
