import { firebase } from '../../services/firebase.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
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
