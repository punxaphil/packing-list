import { ReactNode, useState } from 'react';
import { ErrorContext } from '../../services/contexts';

export default function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string>('');
  return <ErrorContext.Provider value={{ error, setError }}>{children}</ErrorContext.Provider>;
}
