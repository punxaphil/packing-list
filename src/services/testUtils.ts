import { expect } from 'vitest';

import { writeDb } from './database.ts';

export function expectDatabaseCallsToThese(...newParam: DatabaseMethod[]) {
  for (const mockFn of Object.values(writeDb)) {
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
  | typeof writeDb.updatePackItemBatch
  | typeof writeDb.addCategoryBatch
  | typeof writeDb.deletePackItemBatch
  | typeof writeDb.addPackItemBatch
  | typeof writeDb.addMemberBatch;
