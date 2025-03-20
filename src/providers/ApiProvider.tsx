import { ReactNode, useState } from 'react';
import { ApiContext } from '~/providers/ApiContext.ts';
import { Api } from '~/services/api.ts';
import { HistoryItem } from '~/types/HistoryItem.ts';

export function ApiProvider({ children }: { children: ReactNode }) {
  const [changeHistory, setChangeHistory] = useState<HistoryItem[]>([]);
  const api = new Api(changeHistory, setChangeHistory);

  return (
    <>
      <ApiContext.Provider value={{ api, changeHistory }}>{children}</ApiContext.Provider>
    </>
  );
}
