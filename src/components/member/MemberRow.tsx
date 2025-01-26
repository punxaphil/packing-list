import { ChangeEvent } from 'react';
import { useMembersDispatch } from '../../services/contexts.ts';
import { ActionType } from '../../types/Action.tsx';
import { Member } from '../../types/Member.tsx';
import { Flex, IconButton, TextField } from '@radix-ui/themes';
import { TrashIcon } from '@radix-ui/react-icons';

export default function MemberRow({ member }: { member: Member }) {
  const dispatch = useMembersDispatch();

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch({
      type: ActionType.Changed,
      member,
      newName: event.target.value,
    });
  }

  function onRemove() {
    dispatch({
      type: ActionType.Deleted,
      member,
    });
  }

  return (
    <Flex mt="2" gap="3" align="center">
      <TextField.Root size="2" placeholder="Enter a name…" value={member.name} onChange={handleOnChange} />
      <IconButton radius="full" onClick={onRemove} variant="ghost">
        <TrashIcon />
      </IconButton>
    </Flex>
  );
}
