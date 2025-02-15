import { firebase } from '../../services/firebase.ts';
import { useFirebase } from '../providers/FirebaseContext.ts';
import { NamedEntities } from '../shared/NamedEntities.tsx';

export function Categories() {
  return (
    <NamedEntities
      namedEntities={useFirebase().categories}
      type="categories"
      onAdd={firebase.addCategory}
      onUpdate={firebase.updateCategories}
      onDelete={firebase.deleteCategory}
    />
  );
}
