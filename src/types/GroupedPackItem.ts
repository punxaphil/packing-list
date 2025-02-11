import { PackItem } from './PackItem.ts';

export interface GroupedPackItem {
  categoryId: string;
  packItems: PackItem[];
}
