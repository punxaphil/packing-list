import { useReducer } from 'react';
import { ItemContext, ItemDispatchContext, MemberContext, MemberDispatchContext } from '../services/contexts.ts';
import { initialItems, itemsReducer } from '../services/ItemsReducer.ts';
import { initialMembers, membersReducer } from '../services/MembersReducer.ts';

export function Provider({ children }: { children: React.ReactNode }) {
  const [items, dispatchItems] = useReducer(itemsReducer, initialItems());
  const [members, dispatchMembers] = useReducer(membersReducer, initialMembers());

  return (
    <ItemContext.Provider value={items}>
      <ItemDispatchContext.Provider value={dispatchItems}>
        <MemberContext.Provider value={members}>
          <MemberDispatchContext.Provider value={dispatchMembers}>
            {children}
          </MemberDispatchContext.Provider>
        </MemberContext.Provider>
      </ItemDispatchContext.Provider>
    </ItemContext.Provider>
  );
}
