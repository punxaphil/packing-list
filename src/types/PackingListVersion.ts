import { PackItem } from './PackItem.ts';

export interface PackingListVersion {
  id: string;
  packingListId: string;
  timestamp: number;
  name?: string;
  items: PackItem[];
  itemCount: number;
  checkedCount: number;
}
