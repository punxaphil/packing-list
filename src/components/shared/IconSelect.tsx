import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { ReactElement } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';

export function IconSelect({
  label,
  icon,
  items,
  onClick,
  emptyIcon,
}: {
  label: string;
  icon: ReactElement;
  items: MultiSelectItem[];
  onClick: (id: string, name: string) => void;
  emptyIcon?: ReactElement;
}) {
  return (
    <Menu>
      <MenuButton as={IconButton} aria-label={label} icon={icon} variant="ghost" disabled={items.length === 0} />
      <MenuList>
        {items.map((item) => (
          <MenuItem
            key={item.id}
            onClick={() => onClick(item.id, item.name)}
            icon={item.id === '' ? emptyIcon ? emptyIcon : <AiOutlineDelete /> : undefined}
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
