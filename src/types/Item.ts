import { MemberItem } from './MemberItem.ts';

export interface Item {
  id: string;
  name: string;
  checked: boolean;
  members?: MemberItem[];
  category?: string;
}
