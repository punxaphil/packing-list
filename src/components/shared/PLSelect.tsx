import { Box, Select } from '@chakra-ui/react';
import { NamedEntity } from '../../types/NamedEntity.ts';

export default function PLSelect({
  options,
  selected,
  placeholder,
  setSelection,
}: {
  options: NamedEntity[];
  selected: string;
  placeholder: string;
  setSelection: (value: string) => void;
}) {
  return (
    <Box>
      <Select placeholder={placeholder} value={selected} onChange={(e) => setSelection(e.target.value)}>
        {options.map((option, index) => (
          <option key={index} value={option.id}>
            {option.name}
          </option>
        ))}
      </Select>
    </Box>
  );
}
