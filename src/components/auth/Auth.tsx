import { ChangeEvent, KeyboardEvent, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

export function useCurrentUser(): [string, (email: string) => void] {
  const [currentUser, setCurrentUser] = useState('');

  getAuth().onAuthStateChanged((user) => setCurrentUser(user?.email ?? ''));
  return [currentUser, setCurrentUser];
}

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useCurrentUser();

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
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.email) {
          setMessage('');
          setCurrentUser(user.email);
        }
      })
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
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setCurrentUser('');
        setMessage('');
      })
      .catch((error) => handleError(error.code, error.message));
  }

  return (
    <div className="is-flex is-align-items-center">
      {currentUser ? (
        <>
          <span>{currentUser}</span>
          <button onClick={handleLogout} className="button is-light is-small is-danger m-2">
            Logout
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            value={email}
            onChange={handleEmail}
            onKeyDown={handleEnter}
            className="input is-small"
            placeholder="email"
          ></input>
          <input
            type="password"
            value={password}
            onChange={handlePassword}
            onKeyDown={handleEnter}
            className="input is-small m-2"
            placeholder="password"
          ></input>
          <button onClick={handleLogin} className="button is-small is-light is-primary m-2">
            Login
          </button>
          <button onClick={handleRegister} className="button is-small is-light is-success m-2">
            Register
          </button>
        </>
      )}
      <span>{message}</span>
    </div>
  );
}
