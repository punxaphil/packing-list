import { firebase } from '../../services/firebase.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { NamedEntities } from '../shared/NamedEntities.tsx';

export function Members() {
  return (
    <NamedEntities
      namedEntities={useFirebase().members}
      type="members"
      dbAdd={firebase.addMember}
      dbUpdate={firebase.updateMembers}
      dbDelete={firebase.deleteMember}
    />
  );
}
