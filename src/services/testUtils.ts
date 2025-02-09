import { expect } from 'vitest';
import { firebase } from './api.ts';

export function expectFirebaseCallsToThese(...newParam: FirebaseMethod[]) {
  for (const mockFn of Object.values(firebase)) {
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

type FirebaseMethod =
  | typeof firebase.updatePackItemBatch
  | typeof firebase.addCategoryBatch
  | typeof firebase.deletePackItemBatch
  | typeof firebase.addPackItemBatch
  | typeof firebase.addMemberBatch;
