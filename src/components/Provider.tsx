import { useReducer } from 'react';
import {
  CategoryContext,
  CategoryDispatchContext,
  ItemContext,
  ItemDispatchContext,
  MemberContext,
  MemberDispatchContext,
} from '../services/contexts.ts';
import { initialItems, itemsReducer } from '../services/ItemsReducer.ts';
import { initialMembers, membersReducer } from '../services/MembersReducer.ts';
import {
  categoriesReducer,
  initialCategories,
} from '../services/CategoriesReducer.ts';

export function Provider({ children }: { children: React.ReactNode }) {
  const [items, dispatchItems] = useReducer(itemsReducer, initialItems());
  const [members, dispatchMembers] = useReducer(
    membersReducer,
    initialMembers()
  );
  const [categories, dispatchCategories] = useReducer(
    categoriesReducer,
    initialCategories()
  );

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
