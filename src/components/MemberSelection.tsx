import { Member } from '../types/Member.tsx';

export function MemberSelection({ member: { id, name }, selectedMembers, setSelectedMembers }: {
  member: Member,
  selectedMembers: number[],
  setSelectedMembers: (members: number[]) => void,
}) {
  function onChange() {
    if (selectedMembers.find(t => t === id)) {
      setSelectedMembers(selectedMembers.filter(t => t !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  }

  const checked = selectedMembers.find(t => t === id) !== undefined;
  return (
    <label className="checkbox">
      <input className="mx-2" type="checkbox" id={`${id}`} checked={checked} onChange={onChange} />
      {name}
    </label>
  );
}
