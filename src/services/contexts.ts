import { createContext, useContext } from 'react';
import { User } from '../types/User.ts';

export const FirebaseContext = createContext<User | undefined>(undefined);

export function useFirebase() {
  const firebaseContext = useContext(FirebaseContext);
  if (firebaseContext === undefined) {
    throw new Error('useFirebase must be used within a FirebaseContext.Provider');
  }
  return firebaseContext;
}
