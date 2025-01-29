import { Member } from './Member.ts';
import { Item } from './Item.ts';
import { Category } from './Category.ts';

export interface User {
  id: string;
  members: Member[];
  items: Item[];
  categories: Category[];
}
