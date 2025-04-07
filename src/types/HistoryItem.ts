import { PackItem } from '~/types/PackItem.ts';
import { PackingListRow } from '~/types/Column.ts';

export type HistoryItem = HistoryPackItem | HistoryRows;
export interface HistoryPackItem {
  type: 'deleted';
  packItem: PackItem;
}

export interface HistoryRows {
  type: 'prevRows';
  rows: PackingListRow[];
}
