export interface NamedEntity {
  id: string;
  name: string;
  image?: string;
  rank: number;
  color?: string;
  isTemplate?: boolean;
  archived?: boolean;
  pinned?: boolean;
}
