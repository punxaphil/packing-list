import { RiCheckboxLine } from '@react-icons/all-files/ri/RiCheckboxLine';
import { RiCheckboxBlankLine } from '@react-icons/all-files/ri/RiCheckboxBlankLine';

export function Checkbox({ checked, onClick }: { checked: boolean, onClick: () => void }) {
  return checked ? <RiCheckboxLine onClick={onClick} /> :
    <RiCheckboxBlankLine onClick={onClick} />;
}
