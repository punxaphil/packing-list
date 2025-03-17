import { expect } from 'vitest';

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
  | typeof DbInvoke.prototype.addCategory
  | typeof dbInvoke.addCategoryBatch
  | typeof dbInvoke.deletePackItemBatch
  | typeof dbInvoke.addPackItemBatch
  | typeof dbInvoke.addMemberBatch;
