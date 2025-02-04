import { ChangeEvent, KeyboardEvent, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useError } from '../../services/contexts.ts';
import { Button, ButtonGroup, Input, Stack } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

export function useCurrentUser() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loggingIn, setLoggingIn] = useState(true);
  const navigate = useNavigate();

  getAuth().onAuthStateChanged((user) => {
    setUserId(user?.uid ?? '');
    setEmail(user?.email ?? '');
    setLoggingIn(false);
    if (!user) {
      navigate('/');
    }
  });
  return { userId, email, loggingIn };
}

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setError } = useError();
  function handleEmail(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handlePassword(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }

  function handleLogin() {
    const auth = getAuth();
    setPersistence(auth, browserLocalPersistence)
      .then(() => signInWithEmailAndPassword(auth, email, password))
      .catch(setError);
  }

  function handleRegister() {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => signInWithEmailAndPassword(auth, email, password))
      .catch(setError);
  }

  return (
    <Stack w="300px" spacing={4} align="center" m="5">
      <Input value={email} onChange={handleEmail} onKeyDown={handleEnter} placeholder="email" />
      <Input
        type="password"
        value={password}
        onChange={handlePassword}
        onKeyDown={handleEnter}
        placeholder="password"
      />
      <ButtonGroup>
        <Button onClick={handleLogin}>Login</Button>
        <Button onClick={handleRegister} variant="outline">
          Register
        </Button>
      </ButtonGroup>
    </Stack>
  );
}
