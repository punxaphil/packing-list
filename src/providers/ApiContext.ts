import { createContext, useContext } from 'react';
import type { Api } from '~/services/api.ts';
import { HistoryItem } from '~/types/HistoryItem.ts';

interface UseApi {
  api: Api;
  changeHistory: HistoryItem[];
}

export const ApiContext = createContext<UseApi | undefined>(undefined);

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('use context must be used within a Context component');
  }
  return context;
}
