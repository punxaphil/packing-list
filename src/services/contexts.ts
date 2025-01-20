import { createContext, Dispatch, useContext } from 'react';
import { ItemAction, MemberAction } from '../types/Action.tsx';
import { Item } from '../types/Item.tsx';
import { Member } from '../types/Member.tsx';

export const ItemContext = createContext<Item[]>([]);
export const ItemDispatchContext = createContext((() => undefined) as Dispatch<ItemAction>);
export const MemberContext = createContext<Member[]>([]);
export const MemberDispatchContext = createContext((() => undefined) as Dispatch<MemberAction>);

export function useItems() {
  return useContext(ItemContext);
}

export function useItemsDispatch() {
  return useContext(ItemDispatchContext);
}

export function useMembers() {
  return useContext(MemberContext);
}

export function useMembersDispatch() {
  return useContext(MemberDispatchContext);
}
