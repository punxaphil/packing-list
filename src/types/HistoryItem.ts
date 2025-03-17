import { PackItem } from '~/types/PackItem.ts';

export interface HistoryItem {
  type: 'deleted';
  packItem: PackItem;
}
