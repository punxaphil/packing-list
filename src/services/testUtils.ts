import { expect } from 'vitest';
import { Database } from '~/services/database.ts';

export function expectDatabaseCallsToThese(...newParam: DatabaseMethod[]) {
  for (const mockFn of Object.values(Database.prototype)) {
    if (
      newParam.every((mockFn2) => {
        return mockFn !== mockFn2;
      })
    ) {
      expect(mockFn).not.toBeCalled();
    } else {
      expect(mockFn).toBeCalled();
    }
  }
}

type DatabaseMethod =
  | typeof Database.prototype.addCategory
  | typeof Database.prototype.addCategoryBatch
  | typeof Database.prototype.deletePackItemBatch
  | typeof Database.prototype.addPackItemBatch
  | typeof Database.prototype.addMemberBatch;
