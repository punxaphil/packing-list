import { Category } from './Category.tsx';
import { Item } from './Item.tsx';
import { Member } from './Member.tsx';

export enum ActionType {
  Changed = 'changed',
  Added = 'added',
  Deleted = 'deleted',
}

export interface ItemAction {
  type: ActionType;
  name?: string;
  memberIds?: number[];
  item?: Item;
}

export interface MemberAction {
  type: ActionType;
  name?: string;
  member?: Member;
  newName?: string;
}

export interface CategoryAction {
  type: ActionType;
  name?: string;
  category?: Category;
  newName?: string;
}
