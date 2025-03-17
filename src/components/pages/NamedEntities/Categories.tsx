import { NamedEntities } from '~/components/pages/NamedEntities/NamedEntities.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { writeDb } from '~/services/database.ts';

export function Categories() {
  return (
    <NamedEntities
      namedEntities={useDatabase().categories}
      type="categories"
      dbAdd={writeDb.addCategory}
      dbUpdate={writeDb.updateCategories}
      dbDelete={writeDb.deleteCategory}
    />
  );
}
