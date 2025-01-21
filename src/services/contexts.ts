import { createContext, Dispatch, useContext } from 'react';
import { CategoryAction, ItemAction, MemberAction } from '../types/Action.tsx';
import { Item } from '../types/Item.tsx';
import { Member } from '../types/Member.tsx';
import { Category } from '../types/Category.tsx';

export const ItemContext = createContext<Item[]>([]);
export const ItemDispatchContext = createContext(
  (() => undefined) as Dispatch<ItemAction>
);
export const MemberContext = createContext<Member[]>([]);
export const MemberDispatchContext = createContext(
  (() => undefined) as Dispatch<MemberAction>
);
export const CategoryContext = createContext<Category[]>([]);
export const CategoryDispatchContext = createContext(
  (() => undefined) as Dispatch<CategoryAction>
);

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

export function useCategories() {
  return useContext(CategoryContext);
}

export function useCategoriesDispatch() {
  return useContext(CategoryDispatchContext);
}
