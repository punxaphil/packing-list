import React, { useReducer } from 'react';
import { ItemContext, ItemDispatchContext, MemberContext, MemberDispatchContext } from '../services/contexts.ts';
import { itemsReducer } from '../services/ItemsReducer.ts';
import { membersReducer } from '../services/MembersReducer.ts';
import { Member } from '../types/Member.tsx';
import { Item } from '../types/Item.tsx';

export function Provider({ children, initialMembers, initialItems }: {
  children: React.ReactNode,
  initialMembers: Member[],
  initialItems: Item[]
}) {
  const [items, dispatchItems] = useReducer(itemsReducer, initialItems);
  const [members, dispatchMembers] = useReducer(membersReducer, initialMembers);

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
