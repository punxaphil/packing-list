import { NamedEntities } from '~/components/pages/NamedEntities/NamedEntities.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';

export function Members() {
  const { dbInvoke } = useDatabase();
  return (
    <NamedEntities
      namedEntities={useDatabase().members}
      type="members"
      dbAdd={dbInvoke.addMember}
      dbUpdate={dbInvoke.updateMembers}
      dbDelete={dbInvoke.deleteMember}
    />
  );
}
