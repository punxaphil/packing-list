import { Checkbox, CheckboxGroup, HStack } from '@chakra-ui/react';
import { NamedEntity } from '../../types/NamedEntity.ts';

export default function PLCheckboxGroup({
  options,
  selected,
  setSelection,
}: {
  options: NamedEntity[];
  selected: string[];
  setSelection: (value: string[]) => void;
}) {
  return (
    <CheckboxGroup defaultValue={selected} onChange={setSelection}>
      <HStack spacing="5">
        {options.map((option, index) => (
          <Checkbox key={index} value={option.id}>
            {option.name}
          </Checkbox>
        ))}
      </HStack>
    </CheckboxGroup>
  );
}
