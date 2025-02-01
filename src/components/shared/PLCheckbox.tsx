import { Checkbox } from '@chakra-ui/react';

export function PLCheckbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return <Checkbox isChecked={checked} onChange={onClick} />;
}
