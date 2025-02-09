import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { NamedEntities } from '../shared/NamedEntities.tsx';

export function Members() {
  return (
    <NamedEntities
      namedEntities={useFirebase().members}
      type="members"
      onAdd={firebase.addMember}
      onUpdate={firebase.updateMembers}
      onDelete={firebase.deleteMember}
    />
  );
}
