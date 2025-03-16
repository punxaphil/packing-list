import { NamedEntities } from '~/components/pages/NamedEntities/NamedEntities.tsx';
import { useFirebase } from '~/providers/FirebaseContext.ts';
import { firebase } from '~/services/firebase.ts';

export function Categories() {
  return (
    <NamedEntities
      namedEntities={useFirebase().categories}
      type="categories"
      dbAdd={firebase.addCategory}
      dbUpdate={firebase.updateCategories}
      dbDelete={firebase.deleteCategory}
    />
  );
}
