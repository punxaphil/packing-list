import { ChangeEvent } from 'react';
import { Member } from '../../types/Member.ts';
import { Flex, IconButton, TextField } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';
import { firebase } from '../../services/api.ts';
import { useError, useFirebase } from '../../services/contexts.ts';

export default function MemberRow({ member }: { member: Member }) {
  const items = useFirebase().items;
  const { setError } = useError();

  function changeName(event: ChangeEvent<HTMLInputElement>) {
    (async function () {
      if (member.name !== event.target.value) {
        member.name = event.target.value;
        await firebase.updateMember(member);
      }
    })().catch(setError);
  }

  function deleteMember() {
    (async function () {
      for (const item of items) {
        const members = item.members?.filter((m) => m.id !== member.id);
        if (members?.length !== item.members?.length) {
          item.members = members;
          await firebase.updateItem(item);
        }
      }
      await firebase.deleteMember(member.id);
    })().catch(setError);
  }

  return (
    <Flex mt="2" gap="3" align="center">
      <TextField.Root size="2" placeholder="Enter a name…" value={member.name} onChange={changeName} />
      <IconButton radius="full" onClick={deleteMember} variant="ghost">
        <TrashIcon />
      </IconButton>
    </Flex>
  );
}
