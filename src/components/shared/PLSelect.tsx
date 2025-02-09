import { Box, Select } from '@chakra-ui/react';
import { NamedEntity } from '../../types/NamedEntity.ts';

export function PLSelect({
  options,
  selected,
  placeholder,
  setSelection,
  hidden,
}: {
  options: NamedEntity[];
  selected: string;
  placeholder: string;
  setSelection: (value: string) => void;
  hidden?: boolean;
}) {
  return (
    <Box hidden={hidden}>
      <Select placeholder={placeholder} value={selected} onChange={(e) => setSelection(e.target.value)}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Select>
    </Box>
  );
}
