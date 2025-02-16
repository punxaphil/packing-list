import { NamedEntity } from './NamedEntity.ts';
import { PackItem } from './PackItem.ts';

export interface GroupedPackItem {
  category?: NamedEntity;
  packItems: PackItem[];
}
