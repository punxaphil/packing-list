import { createContext, useContext } from 'react';

export type ErrorType = string | string[] | Error;

interface UseError {
  error: ErrorType;
  setError: (error: ErrorType) => void;
}

export const ErrorContext = createContext<UseError | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('use context must be used within a Context component');
  }
  return context;
}
