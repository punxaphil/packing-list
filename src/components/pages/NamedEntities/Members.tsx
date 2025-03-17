import { NamedEntities } from '~/components/pages/NamedEntities/NamedEntities.tsx';
import { useDatabase } from '~/providers/DatabaseContext.ts';
import { writeDb } from '~/services/database.ts';

export function Members() {
  return (
    <NamedEntities
      namedEntities={useDatabase().members}
      type="members"
      dbAdd={writeDb.addMember}
      dbUpdate={writeDb.updateMembers}
      dbDelete={writeDb.deleteMember}
    />
  );
}
