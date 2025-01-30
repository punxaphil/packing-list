import { ChangeEvent, KeyboardEvent, useState } from 'react';
import MemberRow from './MemberRow.tsx';
import { useError, useFirebase } from '../../services/contexts.ts';
import { firebase } from '../../services/api.ts';
import { Box, Button, Card, Flex, TextField } from '@radix-ui/themes';

export default function Members() {
  const members = useFirebase().members;
  const [newName, setNewName] = useState<string>('');
  const { setError } = useError();

  function addMember() {
    (async function () {
      if (!members.find((t) => t.name === newName)) {
        await firebase.addMember(newName);
      }
    })().catch(setError);
    setNewName('');
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
  }

  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      addMember();
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
          <Button onClick={addMember}>Add member</Button>
        </Flex>
      </Card>
    </Box>
  );
}
