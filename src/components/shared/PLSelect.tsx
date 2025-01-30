import { Box, Select } from '@radix-ui/themes';
import { Option } from '../../types/Option';

const NO_OPTION_VALUE = 'NO_OPTION_VALUE';

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
  options = [{ value: NO_OPTION_VALUE, text: placeholder }, ...options];

  function onValueChange(value: string) {
    setSelection(value === NO_OPTION_VALUE ? '' : value);
  }

  return (
    <Box>
      <Select.Root value={selected} onValueChange={onValueChange}>
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
