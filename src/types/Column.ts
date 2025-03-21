import { UNCATEGORIZED } from '~/services/utils.ts';
import { NamedEntity } from './NamedEntity.ts';
import { PackItem } from './PackItem.ts';

export interface ColumnList {
  key: string;
  rows: PackingListRow[];
}

export const COLUMN_COLORS = ['blue.50', 'green.50', 'purple.50', 'orange.50', 'red.50'];

export class PackingListRow {
  id!: string;
  category?: NamedEntity;
  packItem?: PackItem;

  constructor({ category, packItem }: { category?: NamedEntity; packItem?: PackItem }) {
    this.id = category ? category.id : packItem ? packItem.id : '';
    this.category = category;
    this.packItem = packItem;
  }

  setRank(rank: number) {
    if (this.category) {
      this.category.rank = rank;
    } else if (this.packItem) {
      this.packItem.rank = rank;
    }
  }

  getSize() {
    if (this.category) {
      return 1;
    }
    if (this.packItem) {
      return 1 + this.packItem.members.length;
    }
    return 0;
  }

  getColor(categoriesInPackingList: NamedEntity[]) {
    const categoryId = this.category?.id ?? this.packItem?.category;
    if (!categoryId) {
      return UNCATEGORIZED.color;
    }
    for (const [index, namedEntity] of categoriesInPackingList.entries()) {
      if (namedEntity.id === categoryId) {
        if (namedEntity.color) {
          return namedEntity.color;
        }
        return COLUMN_COLORS[index % COLUMN_COLORS.length];
      }
    }
  }
}
