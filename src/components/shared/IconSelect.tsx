import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { AiOutlineDelete } from '@react-icons/all-files/ai/AiOutlineDelete';
import { ReactElement } from 'react';

export function IconSelect({
  label,
  icon,
  items,
  onClick,
}: {
  label: string;
  icon: ReactElement;
  items: MultiSelectItem[];
  onClick: (id: string) => void;
}) {
  return (
    <Menu>
      <MenuButton as={IconButton} aria-label={label} icon={icon} variant="ghost" disabled={items.length === 0} />
      <MenuList>
        {items.map((item) => (
          <MenuItem
            key={item.id}
            onClick={() => onClick(item.id)}
            icon={item.id === '' ? <AiOutlineDelete /> : undefined}
          >
            {item.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

interface MultiSelectItem {
  id: string;
  name: string;
}
