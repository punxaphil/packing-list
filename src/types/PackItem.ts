import { MemberItem } from './MemberItem.ts';

export interface PackItem {
  id: string;
  name: string;
  checked: boolean;
  members?: MemberItem[];
  category?: string;
}
