import { createContext, useContext } from 'react';

export type ErrorType = string | string[] | Error;

interface ContextType {
  error: ErrorType;
  setError: (error: ErrorType) => void;
}

export const ErrorContext = createContext<ContextType | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within a ErrorContext.Provider');
  }
  return context;
}
