import { Checkbox, CheckboxGroup } from '@chakra-ui/react';
import { NamedEntity } from '../../types/NamedEntity.ts';

export function PLCheckboxGroup({
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
      {options.map((option) => (
        <Checkbox key={option.id} value={option.id} mr={5} border="thick" borderColor="gray.200">
          {option.name}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}
