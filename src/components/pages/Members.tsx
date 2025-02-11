import { writeBatch } from 'firebase/firestore';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts.ts';
import { firestore } from '../../services/firebase.ts';
import { NamedEntities } from '../shared/NamedEntities.tsx';

export function Members() {
  const packItems = useFirebase().packItems;

  async function onDelete(id: string) {
    const batch = writeBatch(firestore);
    for (const packItem of packItems) {
      packItem.members = packItem.members?.filter((t) => t.id !== id);
      firebase.updatePackItemBatch(packItem, batch);
    }
    firebase.deleteMemberBatch(id, batch);
    await batch.commit();
  }
  return (
    <NamedEntities
      namedEntities={useFirebase().members}
      type="members"
      onAdd={firebase.addMember}
      onUpdate={firebase.updateMembers}
      onDelete={onDelete}
    />
  );
}
