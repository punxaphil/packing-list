import { useFirebase } from '../../services/contexts';
import { firebase } from '../../services/api.ts';
import { NamedEntities } from '../shared/NamedEntities.tsx';

export function Categories() {
  return (
    <NamedEntities
      namedEntities={useFirebase().categories}
      type="categories"
      onAdd={firebase.addCategory}
      onUpdate={firebase.updateCategory}
      onDelete={firebase.deleteCategory}
    />
  );
}
