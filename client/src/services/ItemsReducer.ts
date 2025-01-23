import { Item } from '../types/Item.tsx';
import { ActionType, ItemAction } from '../types/Action.tsx';
import { saveItems } from './api.ts';

export function itemsReducer(items: Item[], action: ItemAction) {
  let updatedItems = items;
  const { Added, Deleted, Changed } = ActionType;
  if (action.type === Added) {
    updatedItems = addItem(items, action.name, action.memberIds);
  } else if (action.type === Changed) {
    updatedItems = changeItem(items, action.item);
  } else if (action.type === Deleted) {
    updatedItems = items.filter(t => t.id !== action.item?.id);
  } else {
    throw Error(`Unknown action type: ${JSON.stringify(action)}`);
  }
  updatedItems.sort((a: Item, b: Item) => a.checked ? 1 : b.checked ? -1 : a.name.localeCompare(b.name));
  saveItems(updatedItems);
  return updatedItems;
}

function addItem(items: Item[], name?: string, memberIds?: number[]): Item[] {
  if (!name) {
    return items;
  }
  const nextAvailableId = items.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  return [...items, {
    id: nextAvailableId,
    name,
    checked: false,
    members: memberIds?.map(id => ({ id, checked: false })) ?? [],
  }];
}

function changeItem(items: Item[], itemToChange?: Item) {
  return items.map(t => {
    if (t.id === itemToChange?.id) {
      return itemToChange;
    } else {
      return t;
    }
  });
}

