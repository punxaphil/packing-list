import { firebase } from '../../services/api.ts';
import { useFirebase } from '../../services/contexts';
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
