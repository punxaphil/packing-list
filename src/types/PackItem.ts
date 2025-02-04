import { MemberPackItem } from './MemberPackItem.ts';

export interface PackItem {
  id: string;
  name: string;
  checked: boolean;
  members?: MemberPackItem[];
  category?: string;
}
