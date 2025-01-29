import { Box, Select } from '@radix-ui/themes';
import { Option } from '../../types/Option';

export default function PLSelect({
  options,
  selected,
  placeholder,
  setSelection,
}: {
  options: Option[];
  selected: string;
  placeholder: string;
  setSelection: (value: string) => void;
}) {
  return (
    <Box>
      <Select.Root value={selected} onValueChange={setSelection}>
        <Select.Trigger placeholder={placeholder} />
        <Select.Content>
          {options.map((option, index) => (
            <Select.Item key={index} value={option.value}>
              {option.text}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Box>
  );
}
