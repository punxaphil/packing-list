import { describe, expect, it } from 'vitest';

describe('CategoryMenu sorting', () => {
  it('should sort items with international characters correctly', () => {
    const items = [
      { id: '1', name: 'Apple', category: 'cat1', rank: 1, checked: false, members: [], packingList: 'list1' },
      { id: '2', name: 'Övertröja', category: 'cat1', rank: 2, checked: false, members: [], packingList: 'list1' },
      { id: '3', name: 'Banana', category: 'cat1', rank: 3, checked: false, members: [], packingList: 'list1' },
      { id: '4', name: 'orange', category: 'cat1', rank: 4, checked: false, members: [], packingList: 'list1' },
      { id: '5', name: 'äpple', category: 'cat1', rank: 5, checked: false, members: [], packingList: 'list1' },
    ];

    // Test the current implementation
    const sortedItems = [...items].sort((a, b) =>
      a.name.localeCompare(b.name, 'sv-SE', { numeric: true, caseFirst: 'lower' })
    );

    const sortedNames = sortedItems.map((item) => item.name);
    console.log('Sorted names:', sortedNames);

    // In Swedish locale, this should be: Apple, Banana, orange, äpple, Övertröja
    // Ö should come after all regular Latin letters
    const oIndex = sortedNames.indexOf('Övertröja');
    const appleIndex = sortedNames.indexOf('Apple');
    const bananaIndex = sortedNames.indexOf('Banana');
    const orangeIndex = sortedNames.indexOf('orange');

    expect(oIndex).toBeGreaterThan(appleIndex);
    expect(oIndex).toBeGreaterThan(bananaIndex);
    expect(oIndex).toBeGreaterThan(orangeIndex);
  });

  it('should test different sorting approaches', () => {
    const testWords = ['Apple', 'Övertröja', 'orange', 'äpple'];

    console.log('Original:', testWords);

    // Method 1: Current implementation
    const method1 = [...testWords].sort((a, b) => a.localeCompare(b, 'sv-SE', { numeric: true, caseFirst: 'lower' }));
    console.log('Method 1 (Swedish locale, numeric, caseFirst lower):', method1);

    // Test with actual Swedish words from user
    const swedishWords = ['Ipads', 'Kuddar', 'Laddare', 'Vattenflaskor', 'Hink/spadar', 'Hörlurar', 'Id-band'];
    const sortedSwedish = [...swedishWords].sort((a, b) =>
      a.localeCompare(b, 'sv-SE', { numeric: true, caseFirst: 'lower' })
    );
    console.log('Swedish words sorted:', sortedSwedish);

    // Method 2: Direct localeCompare with Swedish locale
    const method2 = [...testWords].sort((a, b) => a.localeCompare(b, 'sv-SE', { sensitivity: 'base' }));
    console.log('Method 2 (Swedish locale, base sensitivity):', method2);

    // Method 3: Direct localeCompare with Swedish locale, case insensitive
    const method3 = [...testWords].sort((a, b) => a.localeCompare(b, 'sv-SE', { sensitivity: 'accent' }));
    console.log('Method 3 (Swedish locale, accent sensitivity):', method3);

    // Method 4: Direct localeCompare with no options
    const method4 = [...testWords].sort((a, b) => a.localeCompare(b));
    console.log('Method 4 (default localeCompare):', method4);

    // Method 5: Explicit Swedish locale with case sensitivity
    const method5 = [...testWords].sort((a, b) => a.localeCompare(b, 'sv-SE', { sensitivity: 'case' }));
    console.log('Method 5 (Swedish locale, case sensitivity):', method5);
  });
});
