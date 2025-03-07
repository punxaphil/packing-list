import { NamedEntity } from './NamedEntity.ts';
import { PackItem } from './PackItem.ts';

export interface PackingListWithItems {
  packingList: NamedEntity;
  packItems: PackItem[];
}
