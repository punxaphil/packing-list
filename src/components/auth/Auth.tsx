import { ChangeEvent, KeyboardEvent, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { useError } from '../../services/contexts.ts';
import { Avatar, Button, Flex, Input, Link, Tooltip } from '@chakra-ui/react';

export function useCurrentUser() {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [loggingIn, setLoggingIn] = useState(true);

  getAuth().onAuthStateChanged((user) => {
    setUserId(user?.uid ?? '');
    setEmail(user?.email ?? '');
    setLoggingIn(false);
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
    <Flex gap="3" align="center">
      <Input value={email} onChange={handleEmail} onKeyDown={handleEnter} size="1" placeholder="email" />
      <Input
        type="password"
        value={password}
        onChange={handlePassword}
        onKeyDown={handleEnter}
        size="1"
        placeholder="password"
      />
      <Button onClick={handleLogin} size="1">
        Login
      </Button>
      <Button onClick={handleRegister} size="1" color="orange">
        Register
      </Button>
    </Flex>
  );
}

export function Logout() {
  const { setError } = useError();
  const currentUser = useCurrentUser();

  function handleLogout() {
    signOut(getAuth()).catch(setError);
  }

  return (
    <Tooltip content={`Logout ${currentUser.email}`}>
      <Link onClick={handleLogout} size="1" href="#">
        <Avatar name={currentUser?.email[0]?.toUpperCase()} />
      </Link>
    </Tooltip>
  );
}
