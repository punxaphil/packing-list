import { ChangeEvent, KeyboardEvent, useState } from 'react';
import MemberRow from './MemberRow.tsx';
import { useMembers, useMembersDispatch } from '../../services/contexts.ts';
import { ActionType } from '../../types/Action.tsx';
import { Box, Button, Card, Flex, TextField } from '@radix-ui/themes';

export default function Members() {
  const members = useMembers();
  const dispatch = useMembersDispatch();
  const [newName, setNewName] = useState<string>('');

  function handleAdd() {
    dispatch({
      type: ActionType.Added,
      name: newName,
    });
    setNewName('');
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
  }

  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleAdd();
    }
  }

  return (
    <Box mt="5" maxWidth="400px">
      <Card>
        {members.map((item, index) => (
          <MemberRow member={item} key={index} />
        ))}
        <Flex mt="2" gap="3" align="center">
          <TextField.Root
            size="2"
            placeholder="Enter a name..."
            value={newName}
            onChange={handleOnChange}
            onKeyDown={handleEnter}
          />
          <Button onClick={handleAdd}>Add member</Button>
        </Flex>
      </Card>
    </Box>
  );
}
