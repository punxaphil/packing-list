import { ReactNode, useState } from 'react';
import { ErrorContext } from './ErrorContext.ts';

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string>('');
  return <ErrorContext value={{ error, setError }}>{children}</ErrorContext>;
}
