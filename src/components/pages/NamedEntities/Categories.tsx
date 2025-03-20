import { NamedEntities } from '~/components/pages/NamedEntities/NamedEntities.tsx';
import { useApi } from '~/providers/ApiContext.ts';
import { useModel } from '~/providers/ModelContext.ts';

export function Categories() {
  const { api } = useApi();
  return (
    <NamedEntities
      namedEntities={useModel().categories}
      type="categories"
      dbAdd={api.addCategory.bind(api)}
      dbUpdate={api.updateCategories.bind(api)}
      dbDelete={api.deleteCategory.bind(api)}
    />
  );
}
