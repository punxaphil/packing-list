import { NamedEntities } from '~/components/pages/NamedEntities/NamedEntities.tsx';
import { useApi } from '~/providers/ApiContext.ts';
import { useModel } from '~/providers/ModelContext.ts';

export function Members() {
  const { api } = useApi();
  return (
    <NamedEntities
      namedEntities={useModel().members}
      type="members"
      dbAdd={api.addMember.bind(api)}
      dbUpdate={api.updateMembers.bind(api)}
      dbDelete={api.deleteMember.bind(api)}
    />
  );
}
