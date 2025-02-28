import { ArrayError } from '../../types/ArrayError.ts';

export function handleArrayError(e: Error) {
  if (e instanceof ArrayError) {
    return e.array;
  }
  return JSON.stringify(e);
}
