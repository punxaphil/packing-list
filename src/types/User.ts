import { NamedEntity } from './NamedEntity.ts';
import { PackItem } from './PackItem.ts';
import { Image } from './Image.ts';

export interface User {
  id: string;
  members: NamedEntity[];
  items: PackItem[];
  categories: NamedEntity[];
  images: Image[];
}
