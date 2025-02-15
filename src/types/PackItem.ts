import { MemberPackItem } from './MemberPackItem.ts';

export interface PackItem {
  id: string;
  name: string;
  checked: boolean;
  members?: MemberPackItem[];
  category?: string;
  packingList?: string;
}

export interface TextPackItem {
  name: string;
  members: string[];
  category?: string;
}
