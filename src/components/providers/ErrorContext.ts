import { createContext, useContext } from 'react';

interface ErrorType {
  error: string;
  setError: (error: string) => void;
}

export const ErrorContext = createContext<ErrorType | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseContext.Provider');
  }
  return context;
}
