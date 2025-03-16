import { NamedEntities } from '~/components/pages/NamedEntities/NamedEntities.tsx';
import { useFirebase } from '~/providers/FirebaseContext.ts';
import { firebase } from '~/services/firebase.ts';

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
