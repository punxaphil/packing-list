import { firebase } from './api.ts';
import { expect } from 'vitest';

export function expectFirebaseCallsToThese(...newParam: FirebaseMethod[]) {
  Object.values(firebase).forEach((mockFn) => {
    if (
      newParam.every((mockFn2) => {
        return mockFn !== mockFn2;
      })
    ) {
      expect(mockFn).not.toBeCalled();
    } else {
      expect(mockFn).toBeCalled();
    }
  });
}

type FirebaseMethod =
  | typeof firebase.updatePackItem
  | typeof firebase.addCategory
  | typeof firebase.deletePackItem
  | typeof firebase.addPackItem
  | typeof firebase.addMember
  | typeof firebase.updateMembers
  | typeof firebase.deleteMember
  | typeof firebase.updateCategories
  | typeof firebase.deleteCategory
  | typeof firebase.addImage
  | typeof firebase.updateImage
  | typeof firebase.deleteImage;
