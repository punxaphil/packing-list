import { WriteBatch } from 'firebase/firestore';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NamedEntity } from '~/types/NamedEntity';
import { PackItem, TextPackItem } from '~/types/PackItem';
import { writeDb } from './database.ts';
import { expectDatabaseCallsToThese } from './testUtils.ts';
import { createTextPackItemsFromText, updateDatabaseFromTextPackItems } from './textModeUtils.ts';

const PACKING_LIST_ID = 'packingListId';

vi.mock('./database.ts');

const writeBatchMock = { commit: () => {} } as WriteBatch;
vi.mocked(writeDb.initBatch).mockImplementation(() => {
  return writeBatchMock;
});

describe('textModeUtils', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('createTextPackItemsFromText', () => {
    it('should create items with categories and members', () => {
      const input = `
        Category 1
        -Item 1
        --Member 1
        --Member 2
        -Item 2
        --Member 3
        Category 2
        -Item 3
        --Member 4
        `;

      const expectedOutput: TextPackItem[] = [
        { name: 'Item 1', members: ['Member 1', 'Member 2'], category: 'Category 1' },
        { name: 'Item 2', members: ['Member 3'], category: 'Category 1' },
        { name: 'Item 3', members: ['Member 4'], category: 'Category 2' },
      ];

      const result = createTextPackItemsFromText(input);
      expect(result).toEqual(expectedOutput);
    });

    it('should handle empty input', () => {
      const input = '';
      const expectedOutput: TextPackItem[] = [];
      const result = createTextPackItemsFromText(input);
      expect(result).toEqual(expectedOutput);
    });

    it('should handle input with no members', () => {
      const input = `
        Category 1
        -Item 1
        -Item 2
        Category 2
        -Item 3
        `;

      const expectedOutput: TextPackItem[] = [
        { name: 'Item 1', members: [], category: 'Category 1' },
        { name: 'Item 2', members: [], category: 'Category 1' },
        { name: 'Item 3', members: [], category: 'Category 2' },
      ];

      const result = createTextPackItemsFromText(input);
      expect(result).toEqual(expectedOutput);
    });

    it('should handle input with no categories', () => {
      const input = `
        -Item 1
        --Member 1
        -Item 2
        --Member 2
        `;

      const expectedOutput: TextPackItem[] = [
        { name: 'Item 1', members: ['Member 1'], category: '' },
        { name: 'Item 2', members: ['Member 2'], category: '' },
      ];

      const result = createTextPackItemsFromText(input);
      expect(result).toEqual(expectedOutput);
    });
  });

  describe('updateDatabaseFromTextPackItems', () => {
    it('should delete removed pack items', async () => {
      const packItems: PackItem[] = [
        { id: '1', name: 'Item 1', checked: false, members: [], rank: 0, packingList: PACKING_LIST_ID, category: '' },
      ];
      const textPackItems: TextPackItem[] = [];
      const members: NamedEntity[] = [];
      const categories: NamedEntity[] = [];

      await updateDatabaseFromTextPackItems(packItems, textPackItems, members, categories, PACKING_LIST_ID);

      expectDatabaseCallsToThese(writeDb.deletePackItemBatch, writeDb.initBatch);
    });

    it('should not update existing pack items', async () => {
      const packItems: PackItem[] = [
        { id: '1', name: 'Item 1', members: [], checked: false, rank: 1, packingList: PACKING_LIST_ID, category: '' },
      ];
      const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: [], category: '' }];
      const members: NamedEntity[] = [];
      const categories: NamedEntity[] = [];

      await updateDatabaseFromTextPackItems(packItems, textPackItems, members, categories, PACKING_LIST_ID);

      expectDatabaseCallsToThese(writeDb.initBatch);
    });

    it('should update existing pack items', async () => {
      const packItems: PackItem[] = [
        { id: '1', name: 'Item 1', checked: false, members: [], rank: 0, packingList: PACKING_LIST_ID, category: '' },
      ];
      const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: ['Member 1'], category: '' }];
      const members: NamedEntity[] = [{ id: '2', name: 'Member 1', rank: 0 }];
      const categories: NamedEntity[] = [];

      await updateDatabaseFromTextPackItems(packItems, textPackItems, members, categories, PACKING_LIST_ID);

      expectDatabaseCallsToThese(writeDb.updatePackItemBatch, writeDb.initBatch);
    });

    it('should update existing pack items because category changed', async () => {
      const packItems: PackItem[] = [
        { id: '1', name: 'Item 1', checked: false, members: [], category: '2', rank: 0, packingList: PACKING_LIST_ID },
      ];
      const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: [], category: 'Category 1' }];
      const members: NamedEntity[] = [];
      const categories: NamedEntity[] = [{ id: '2', name: 'Category 2', rank: 0 }];

      await updateDatabaseFromTextPackItems(packItems, textPackItems, members, categories, PACKING_LIST_ID);

      expectDatabaseCallsToThese(writeDb.updatePackItemBatch, writeDb.addCategoryBatch, writeDb.initBatch);
    });

    it('should add new pack items', async () => {
      const packItems: PackItem[] = [];
      const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: [], category: '' }];
      const members: NamedEntity[] = [];
      const categories: NamedEntity[] = [];

      await updateDatabaseFromTextPackItems(packItems, textPackItems, members, categories, PACKING_LIST_ID);

      expectDatabaseCallsToThese(writeDb.addPackItemBatch, writeDb.initBatch);
    });

    it('should add 3 new pack items, update 2 pack items, delete 5 pack items, add one new category, add 2 members', async () => {
      const packItems: PackItem[] = [
        { id: '1', name: 'Item 1', checked: true, members: [], category: '2', rank: 0, packingList: PACKING_LIST_ID },
        {
          id: '2',
          name: 'Item 2',
          checked: false,
          members: [{ id: '2', checked: true }],
          category: '2',
          rank: 2,
          packingList: PACKING_LIST_ID,
        },
        { id: '6', name: 'Item 6', checked: false, rank: 7, packingList: PACKING_LIST_ID, members: [], category: '' },
        { id: '7', name: 'Item 7', checked: false, rank: 9, packingList: PACKING_LIST_ID, members: [], category: '' },
        { id: '8', name: 'Item 8', checked: false, rank: 1, packingList: PACKING_LIST_ID, members: [], category: '' },
        { id: '9', name: 'Item 9', checked: false, rank: 3, packingList: PACKING_LIST_ID, members: [], category: '' },
        { id: '10', name: 'Item 10', checked: false, rank: 6, packingList: PACKING_LIST_ID, members: [], category: '' },
      ];
      const textPackItems: TextPackItem[] = [
        { name: 'Item 1', members: ['Member 1'], category: 'Category 1' },
        { name: 'Item 2', members: ['Member 2', 'Member 1'], category: 'Category 1' },
        { name: 'Item 3', members: ['Member 3'], category: 'Category 2' },
        { name: 'Item 4', members: [], category: 'Category 2' },
        { name: 'Item 5', members: ['Member 2', 'Member 3'], category: '' },
      ];
      const members: NamedEntity[] = [
        { id: '2', name: 'Member 2', rank: 0 },
        { id: '6', name: 'Member 6', rank: 0 },
        { id: '7', name: 'Member 7', rank: 0 },
      ];
      const categories: NamedEntity[] = [{ id: '2', name: 'Category 2', rank: 0 }];

      vi.mocked(writeDb.addMemberBatch).mockImplementation((name: string) => `added${name}`);
      vi.mocked(writeDb.addCategoryBatch).mockImplementation((name: string) => `added${name}`);

      await updateDatabaseFromTextPackItems(packItems, textPackItems, members, categories, PACKING_LIST_ID);
      expect(writeDb.addPackItemBatch).toHaveBeenCalledTimes(3);
      expect(writeDb.addPackItemBatch).toHaveBeenNthCalledWith(
        1,
        writeBatchMock,
        'Item 3',
        [{ id: 'addedMember 3', checked: false }],
        '2',
        3,
        PACKING_LIST_ID
      );
      expect(writeDb.addPackItemBatch).toHaveBeenNthCalledWith(
        2,
        writeBatchMock,
        'Item 4',
        [],
        '2',
        2,
        PACKING_LIST_ID
      );
      expect(writeDb.addPackItemBatch).toHaveBeenNthCalledWith(
        3,
        writeBatchMock,
        'Item 5',
        [
          { id: '2', checked: false },
          { id: 'addedMember 3', checked: false },
        ],
        '',
        1,
        PACKING_LIST_ID
      );
      expect(writeDb.updatePackItemBatch).toHaveBeenCalledTimes(2);
      expect(writeDb.updatePackItemBatch).toHaveBeenNthCalledWith(
        1,
        {
          id: '1',
          name: 'Item 1',
          checked: true,
          members: [{ id: 'addedMember 1', checked: false }],
          category: 'addedCategory 1',
          rank: 5,
          packingList: PACKING_LIST_ID,
        },
        writeBatchMock
      );
      expect(writeDb.updatePackItemBatch).toHaveBeenNthCalledWith(
        2,
        {
          id: '2',
          name: 'Item 2',
          checked: false,
          members: [
            { id: '2', checked: true },
            { id: 'addedMember 1', checked: false },
          ],
          category: 'addedCategory 1',
          rank: 4,
          packingList: PACKING_LIST_ID,
        },
        writeBatchMock
      );
      expect(writeDb.addCategoryBatch).toHaveBeenCalledTimes(1);
      expect(writeDb.addCategoryBatch).toHaveBeenCalledWith('Category 1', writeBatchMock);
      expect(writeDb.addMemberBatch).toHaveBeenCalledTimes(2);
      expect(writeDb.addMemberBatch).toHaveBeenNthCalledWith(1, 'Member 1', writeBatchMock);
      expect(writeDb.addMemberBatch).toHaveBeenNthCalledWith(2, 'Member 3', writeBatchMock);

      expect(writeDb.deletePackItemBatch).toHaveBeenCalledTimes(5);
    });
  });
});
