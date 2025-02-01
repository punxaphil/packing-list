import { useFirebase } from '../../services/contexts.ts';
import { firebase } from '../../services/api.ts';
import NamedEntities from '../shared/NamedEntities.tsx';

export default function Members() {
  return (
    <NamedEntities
      namedEntities={useFirebase().members}
      onAdd={firebase.addMember}
      onUpdate={firebase.updateMember}
      onDelete={firebase.deleteMember}
    />
  );
}
