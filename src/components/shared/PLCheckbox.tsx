import { Checkbox } from '@radix-ui/themes';

export function PLCheckbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return <Checkbox size="2" checked={checked} onCheckedChange={onClick} />;
}
