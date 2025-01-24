import React, { useReducer } from 'react';
import {
  CategoryContext,
  CategoryDispatchContext,
  ItemContext,
  ItemDispatchContext,
  MemberContext,
  MemberDispatchContext,
} from '../services/contexts.ts';
import { itemsReducer } from '../services/ItemsReducer.ts';
import { membersReducer } from '../services/MembersReducer.ts';
import { Member } from '../types/Member.tsx';
import { Item } from '../types/Item.tsx';
import { categoriesReducer } from '../services/CategoriesReducer.ts';
import { Category } from '../types/Category.tsx';

export function Provider({ children, initialMembers, initialItems, initialCategories }: {
  children: React.ReactNode,
  initialMembers: Member[],
  initialItems: Item[],
  initialCategories: Category[]
}) {
  const [items, dispatchItems] = useReducer(itemsReducer, initialItems);
  const [members, dispatchMembers] = useReducer(membersReducer, initialMembers);
  const [categories, dispatchCategories] = useReducer(categoriesReducer, initialCategories);

  return (
    <ItemContext.Provider value={items}>
      <ItemDispatchContext.Provider value={dispatchItems}>
        <MemberContext.Provider value={members}>
          <MemberDispatchContext.Provider value={dispatchMembers}>
            <CategoryContext.Provider value={categories}>
              <CategoryDispatchContext.Provider value={dispatchCategories}>
                {children}
              </CategoryDispatchContext.Provider>
            </CategoryContext.Provider>
          </MemberDispatchContext.Provider>
        </MemberContext.Provider>
      </ItemDispatchContext.Provider>
    </ItemContext.Provider>
  );
}
