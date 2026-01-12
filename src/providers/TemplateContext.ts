import { createContext, useContext } from 'react';
import type { NamedEntity } from '~/types/NamedEntity.ts';

export interface TemplateContextType {
  templateList: NamedEntity | null;
  isTemplateList: (listId: string) => boolean;
}

export const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}
