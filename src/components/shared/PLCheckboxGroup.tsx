import { CheckboxGroup, Flex, Text } from '@radix-ui/themes';
import { Option } from '../../types/Option';

export default function PLCheckboxGroup({
  options,
  selected,
  setSelection,
}: {
  options: Option[];
  selected: string[];
  setSelection: (value: string[]) => void;
}) {
  return (
    <CheckboxGroup.Root value={selected} onValueChange={setSelection}>
      <Flex gap="4" direction="row">
        {options.map((option, index) => (
          <Text size="3" key={index}>
            <Flex gap="1">
              <CheckboxGroup.Item value={option.value} />
              {option.text}
            </Flex>
          </Text>
        ))}
      </Flex>
    </CheckboxGroup.Root>
  );
}
