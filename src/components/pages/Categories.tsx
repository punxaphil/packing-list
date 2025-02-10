import { writeBatch } from 'firebase/firestore';
import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts';
import { firestore } from '../../services/firebase.ts';
import { NamedEntities } from '../shared/NamedEntities.tsx';

export function Categories() {
  const packItems = useFirebase().packItems;

  async function onDelete(id: string) {
    const batch = writeBatch(firestore);
    for (const packItem of packItems) {
      if (packItem.category === id) {
        packItem.category = '';
        firebase.updatePackItemBatch(packItem, batch);
      }
    }
    firebase.deleteCategoryBatch(id, batch);
    await batch.commit();
  }

  return (
    <NamedEntities
      namedEntities={useFirebase().categories}
      type="categories"
      onAdd={firebase.addCategory}
      onUpdate={firebase.updateCategories}
      onDelete={onDelete}
    />
  );
}
