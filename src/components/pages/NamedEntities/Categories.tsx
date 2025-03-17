import { NamedEntities } from '~/components/pages/NamedEntities/NamedEntities.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';

export function Categories() {
  const { dbInvoke } = useDatabase();
  return (
    <NamedEntities
      namedEntities={useDatabase().categories}
      type="categories"
      dbAdd={dbInvoke.addCategory}
      dbUpdate={dbInvoke.updateCategories}
      dbDelete={dbInvoke.deleteCategory}
    />
  );
}
