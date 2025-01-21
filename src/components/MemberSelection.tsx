import { Member } from '../types/Member.tsx';
import { Checkbox } from './Checkbox.tsx';

export function MemberSelection({
  member: { id, name },
  selectedMembers,
  setSelectedMembers,
}: {
  member: Member;
  selectedMembers: number[];
  setSelectedMembers: (members: number[]) => void;
}) {
  function onChange() {
    if (selectedMembers.find((t) => t === id)) {
      setSelectedMembers(selectedMembers.filter((t) => t !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  }

  const checked = selectedMembers.find((t) => t === id) !== undefined;
  return (
    <label className="checkbox is-flex is-align-items-center">
      <Checkbox checked={checked} onClick={onChange} />
      <span className='ml-1'>{name}</span>
    </label>
  );
}
