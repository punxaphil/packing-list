import { ChangeEvent, KeyboardEvent, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Button, Flex, Text, TextField } from '@radix-ui/themes';

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

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const currentUser = useCurrentUser();

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
      .catch((error) => handleError(error.code, error.message));
  }

  function handleError(code: string, msg: string) {
    setMessage(`Error: ${code} - ${msg}`);
  }

  function handleRegister() {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setMessage(`Registered as ${user.email}`);
      })
      .catch((error) => handleError(error.code, error.message));
  }

  function handleLogout() {
    signOut(getAuth())
      .then(() => setMessage(''))
      .catch((error) => handleError(error.code, error.message));
  }

  return (
    <Flex gap="3" align="center">
      {currentUser.userId ? (
        <>
          <Text size="1">{currentUser.email}</Text>
          <Button onClick={handleLogout} size="1" color="red">
            Logout
          </Button>
        </>
      ) : (
        <>
          <TextField.Root
            value={email}
            onChange={handleEmail}
            onKeyDown={handleEnter}
            size="1"
            placeholder="email"
          ></TextField.Root>
          <TextField.Root
            type="password"
            value={password}
            onChange={handlePassword}
            onKeyDown={handleEnter}
            size="1"
            placeholder="password"
          ></TextField.Root>
          <Button onClick={handleLogin} size="1">
            Login
          </Button>
          <Button onClick={handleRegister} size="1" color="orange">
            Register
          </Button>
        </>
      )}
      {message}
    </Flex>
  );
}
