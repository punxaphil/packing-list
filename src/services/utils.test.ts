import { describe, expect, it } from 'vitest';
import { NamedEntity } from '../types/NamedEntity';
import { PackItem } from '../types/PackItem';
import { sortPackItems } from './utils';
import { sortEntities } from './utils';

describe('utils', () => {
  describe('sortEntities', () => {
    it('should sort entities by rank in descending order', () => {
      const entities: NamedEntity[] = [
        { id: '1', name: 'Entity 1', rank: 2 },
        { id: '2', name: 'Entity 2', rank: 3 },
        { id: '3', name: 'Entity 3', rank: 1 },
      ];

      sortEntities(entities);

      expect(entities).toEqual([
        { id: '2', name: 'Entity 2', rank: 3 },
        { id: '1', name: 'Entity 1', rank: 2 },
        { id: '3', name: 'Entity 3', rank: 1 },
      ]);
    });

    it('should handle empty array', () => {
      const entities: NamedEntity[] = [];

      sortEntities(entities);

      expect(entities).toEqual([]);
    });

    it('should handle entities with the same rank', () => {
      const entities: NamedEntity[] = [
        { id: '1', name: 'Entity 1', rank: 2 },
        { id: '2', name: 'Entity 2', rank: 2 },
      ];

      sortEntities(entities);

      expect(entities).toEqual([
        { id: '1', name: 'Entity 1', rank: 2 },
        { id: '2', name: 'Entity 2', rank: 2 },
      ]);
    });
  });

  describe('sortPackItems', () => {
    it('should sort pack items by category rank, then checked status, and finally by pack item rank', () => {
      const item = (id: number, checked: boolean, category: number, rank: number) => ({
        id: `${id}`,
        name: `Item ${id}`,
        checked,
        members: [],
        category: `${category}`,
        rank,
        packingList: 'list1',
      });
      const packItems: PackItem[] = [
        item(1, true, 1, 2),
        item(2, false, 2, 3),
        item(3, false, 1, 1),
        item(4, true, 2, 2),
        item(5, true, 3, 2),
        item(6, true, 2, 4),
        item(7, false, 2, 5),
        item(8, false, 3, 1),
        item(9, true, 2, 6),
      ];
      const categories: NamedEntity[] = [
        { id: '1', name: 'Category 1', rank: 1 },
        { id: '2', name: 'Category 2', rank: 2 },
        { id: '3', name: 'Category 3', rank: 3 },
      ];

      sortPackItems(packItems, [], categories);

      expect(packItems).toEqual([
        item(8, false, 3, 1),
        item(5, true, 3, 2),
        item(7, false, 2, 5),
        item(2, false, 2, 3),
        item(9, true, 2, 6),
        item(6, true, 2, 4),
        item(4, true, 2, 2),
        item(3, false, 1, 1),
        item(1, true, 1, 2),
      ]);
    });

    it('should sort pack items by member rank within each pack item', () => {
      const packItems: PackItem[] = [
        {
          id: '1',
          name: 'Item 1',
          checked: false,
          members: [
            { id: '1', checked: false },
            { id: '2', checked: false },
          ],
          category: '1',
          rank: 2,
          packingList: 'list1',
        },
      ];
      const members: NamedEntity[] = [
        { id: '1', name: 'Member 1', rank: 2 },
        { id: '2', name: 'Member 2', rank: 1 },
      ];
      const categories: NamedEntity[] = [{ id: '1', name: 'Category 1', rank: 1 }];

      sortPackItems(packItems, members, categories);

      expect(packItems[0].members).toEqual([
        { id: '1', checked: false },
        { id: '2', checked: false },
      ]);
    });
  });
});
