import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useDatabase } from './DatabaseContext.ts';
import { TemplateContext } from './TemplateContext.ts';

interface TemplateProviderProps {
  children: ReactNode;
}

export function TemplateProvider({ children }: TemplateProviderProps) {
  const { packingLists } = useDatabase();

  const templateList = useMemo(() => {
    return packingLists.find((list) => list.isTemplate) ?? null;
  }, [packingLists]);

  const isTemplateList = useCallback(
    (listId: string) => {
      return templateList?.id === listId;
    },
    [templateList]
  );

  const value = useMemo(
    () => ({
      templateList,
      isTemplateList,
    }),
    [templateList, isTemplateList]
  );

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
}
