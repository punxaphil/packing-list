import { Button, ButtonGroup, Input, Stack } from '@chakra-ui/react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useError } from '~/providers/ErrorContext.ts';
import { handleEnter } from '~/services/utils.ts';

export function useCurrentUser() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loggingIn, setLoggingIn] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  getAuth().onAuthStateChanged((user) => {
    setUserId(user?.uid ?? '');
    setEmail(user?.email ?? '');
    setLoggingIn(false);
    if (!user && location.pathname !== '/') {
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

  function onEnter(e: KeyboardEvent<HTMLInputElement>) {
    handleEnter(e, handleLogin);
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
      <Input value={email} onChange={handleEmail} onKeyDown={onEnter} placeholder="email" />
      <Input type="password" value={password} onChange={handlePassword} onKeyDown={onEnter} placeholder="password" />
      <ButtonGroup>
        <Button onClick={handleLogin}>Login</Button>
        <Button onClick={handleRegister} variant="outline">
          Register
        </Button>
      </ButtonGroup>
    </Stack>
  );
}
