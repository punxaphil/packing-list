import { Button, ButtonProps } from '@chakra-ui/react';
import { COLUMN_COLORS } from '~/types/Column.ts';
import { NamedEntity } from '~/types/NamedEntity.ts';

interface CategoryButtonProps extends Omit<ButtonProps, 'onClick'> {
  category: NamedEntity;
  index: number;
  onClick: (category: NamedEntity) => void;
}

export function CategoryButton({ category, index, onClick, ...rest }: CategoryButtonProps) {
  return (
    <Button
      key={category.id}
      onClick={() => onClick(category)}
      m='2'
      bg={category.color || COLUMN_COLORS[index % COLUMN_COLORS.length]}
      {...rest}
    >
      {category.name}
    </Button>
  );
}