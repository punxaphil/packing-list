import { describe, expect, it, vi } from 'vitest';
import { createTextPackItemsFromText } from './batchUtils.ts';
import { PackItem, TextPackItem } from '../types/PackItem';
import { updateFirebaseFromTextPackItems } from './batchUtils';
import { firebase } from './api';
import { NamedEntity } from '../types/NamedEntity';

describe('createTextPackItemsFromText', () => {
  it('should create items with categories and members', () => {
    const input = `
Category 1
  Item 1
    Member 1
    Member 2
  Item 2
    Member 3
Category 2
  Item 3
    Member 4
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
  Item 1
  Item 2
Category 2
  Item 3
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
  Item 1
    Member 1
  Item 2
    Member 2
`;

    const expectedOutput: TextPackItem[] = [
      { name: 'Item 1', members: ['Member 1'], category: undefined },
      { name: 'Item 2', members: ['Member 2'], category: undefined },
    ];

    const result = createTextPackItemsFromText(input);
    expect(result).toEqual(expectedOutput);
  });
});

vi.mock('./api');

describe('updateFirebaseFromTextPackItems', () => {
  it('should delete removed pack items', async () => {
    const packItems: PackItem[] = [{ id: '1', name: 'Item 1', checked: false }];
    const textPackItems: TextPackItem[] = [];
    const members: NamedEntity[] = [];
    const categories: NamedEntity[] = [];

    await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

    expect(firebase.deletePackItem).toHaveBeenCalledWith('1');
  });

  it('should not update existing pack items', async () => {
    const packItems: PackItem[] = [{ id: '1', name: 'Item 1', checked: false }];
    const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: [], category: undefined }];
    const members: NamedEntity[] = [];
    const categories: NamedEntity[] = [];

    await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

    expect(firebase.updatePackItem).toHaveBeenCalledTimes(0);
  });

  it('should update existing pack items', async () => {
    const packItems: PackItem[] = [{ id: '1', name: 'Item 1', checked: false, members: [] }];
    const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: ['Member 1'], category: undefined }];
    const members: NamedEntity[] = [{ id: '2', name: 'Member 1' }];
    const categories: NamedEntity[] = [];

    await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

    expect(firebase.updatePackItem).toHaveBeenCalled();
  });

  it('should update existing pack items because category changed', async () => {
    const packItems: PackItem[] = [{ id: '1', name: 'Item 1', checked: false, members: [], category: '2' }];
    const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: [], category: 'Category 1' }];
    const members: NamedEntity[] = [];
    const categories: NamedEntity[] = [{ id: '2', name: 'Category 2' }];

    await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

    expect(firebase.updatePackItem).toHaveBeenCalled();
    expect(firebase.addCategory).toHaveBeenCalled();
  });

  it('should add new pack items', async () => {
    const packItems: PackItem[] = [];
    const textPackItems: TextPackItem[] = [{ name: 'Item 1', members: [], category: undefined }];
    const members: NamedEntity[] = [];
    const categories: NamedEntity[] = [];

    await updateFirebaseFromTextPackItems(packItems, textPackItems, members, categories);

    expect(firebase.addPackItem).toHaveBeenCalled();
  });
});
