import { Image } from './Image.ts';
import { NamedEntity } from './NamedEntity.ts';
import { PackItem } from './PackItem.ts';

export interface User {
  id: string;
  members: NamedEntity[];
  packItems: PackItem[];
  categories: NamedEntity[];
  images: Image[];
}
