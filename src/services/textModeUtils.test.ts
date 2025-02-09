import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemberPackItem } from '../types/MemberPackItem.ts';
import { NamedEntity } from '../types/NamedEntity';
import { PackItem, TextPackItem } from '../types/PackItem';
import { firebase } from './api';
import { expectFirebaseCallsToThese } from './testUtils.ts';
import { createTextPackItemsFromText, updateFirebaseFromTextPackItems } from './textModeUtils.ts';

vi.mock('./api');

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

  describe('updateFirebaseFromTextPackItems', () => {
    it('should delete removed pack items', async () => {
      const packItems: PackItem[] = [{ id: '1', name: 'Item 1', checked: false }];
      const textPackItems: TextPackItem[] = [];
      const members: NamedEntity[] = [];
      const categories: NamedEntity[] = [];

      await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

      expectFirebaseCallsToThese(firebase.deletePackItem);
    });

    it('should not update existing pack items', async () => {
      const packItems: PackItem[] = [{ id: '1', name: 'Item 1', members: [], checked: false }];
      const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: [], category: undefined }];
      const members: NamedEntity[] = [];
      const categories: NamedEntity[] = [];

      await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

      expectFirebaseCallsToThese();
    });

    it('should update existing pack items', async () => {
      const packItems: PackItem[] = [{ id: '1', name: 'Item 1', checked: false, members: [] }];
      const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: ['Member 1'], category: undefined }];
      const members: NamedEntity[] = [{ id: '2', name: 'Member 1' }];
      const categories: NamedEntity[] = [];

      await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

      expectFirebaseCallsToThese(firebase.updatePackItem);
    });

    it('should update existing pack items because category changed', async () => {
      const packItems: PackItem[] = [{ id: '1', name: 'Item 1', checked: false, members: [], category: '2' }];
      const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: [], category: 'Category 1' }];
      const members: NamedEntity[] = [];
      const categories: NamedEntity[] = [{ id: '2', name: 'Category 2' }];

      await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

      expectFirebaseCallsToThese(firebase.updatePackItem, firebase.addCategory);
    });

    it('should add new pack items', async () => {
      const packItems: PackItem[] = [];
      const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: [], category: undefined }];
      const members: NamedEntity[] = [];
      const categories: NamedEntity[] = [];

      await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

      expectFirebaseCallsToThese(firebase.addPackItem);
    });

    it('should add 3 new pack items, update 2 pack items, delete 5 pack items, add one new category, add 2 members', async () => {
      const packItems: PackItem[] = [
        { id: '1', name: 'Item 1', checked: true, members: [], category: '2' },
        { id: '2', name: 'Item 2', checked: false, members: [{ id: '2', checked: true }], category: '2' },
        { id: '6', name: 'Item 6', checked: false },
        { id: '7', name: 'Item 7', checked: false },
        { id: '8', name: 'Item 8', checked: false },
        { id: '9', name: 'Item 9', checked: false },
        { id: '10', name: 'Item 10', checked: false },
      ];
      const textPackItems: TextPackItem[] = [
        { name: 'Item 1', members: ['Member 1'], category: 'Category 1' },
        { name: 'Item 2', members: ['Member 2', 'Member 1'], category: 'Category 1' },
        { name: 'Item 3', members: ['Member 3'], category: 'Category 2' },
        { name: 'Item 4', members: [], category: 'Category 2' },
        { name: 'Item 5', members: ['Member 2', 'Member 3'] },
      ];
      const members: NamedEntity[] = [
        { id: '2', name: 'Member 2' },
        { id: '6', name: 'Member 6' },
        { id: '7', name: 'Member 7' },
      ];
      const categories: NamedEntity[] = [{ id: '2', name: 'Category 2' }];
      const expected: PackItem[] = [
        {
          id: '1',
          name: 'Item 1',
          checked: true,
          members: [{ id: 'addedMember 1', checked: false }],
          category: 'addedCategory 1',
        },
        {
          id: '2',
          name: 'Item 2',
          checked: false,
          members: [
            { id: '2', checked: true },
            { id: 'addedMember 1', checked: false },
          ],
          category: 'addedCategory 1',
        },
        { id: '6', name: 'Item 6', checked: false },
        { id: '7', name: 'Item 7', checked: false },
        { id: '8', name: 'Item 8', checked: false },
        { id: '9', name: 'Item 9', checked: false },
        { id: '10', name: 'Item 10', checked: false },
        {
          id: 'addedItem 3',
          name: 'Item 3',
          checked: false,
          members: [{ id: 'addedMember 3', checked: false }],
          category: '2',
        },
        { id: 'addedItem 4', name: 'Item 4', checked: false, members: [], category: '2' },
        {
          id: 'addedItem 5',
          name: 'Item 5',
          checked: false,
          members: [
            { id: '2', checked: false },
            { id: 'addedMember 3', checked: false },
          ],
          category: '',
        },
      ];

      vi.mocked(firebase.addPackItem).mockImplementation((name: string, members: MemberPackItem[], category: string) =>
        Promise.resolve({ id: `added${name}`, name, members, category, checked: false })
      );
      vi.mocked(firebase.addMember).mockImplementation((name: string) => Promise.resolve(`added${name}`));
      vi.mocked(firebase.addCategory).mockImplementation((name: string) => Promise.resolve(`added${name}`));

      await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);
      expect(firebase.addPackItem).toHaveBeenCalledTimes(3);
      expect(firebase.updatePackItem).toHaveBeenCalledTimes(2);
      expect(firebase.addCategory).toHaveBeenCalledTimes(1);
      expect(firebase.addMember).toHaveBeenCalledTimes(2);

      expect(firebase.deletePackItem).toHaveBeenCalledTimes(5);

      expect(packItems).toEqual(expected);
    });
  });
});
