import { MemberItem } from './MemberItem.tsx';

export interface Item {
  id: number;
  name: string;
  checked: boolean;
  members?: MemberItem[];
}

