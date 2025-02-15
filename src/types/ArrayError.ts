export class ArrayError extends Error {
  constructor(array: string[]) {
    super(`ArrayError: ${array.join(', ')}`);
    this.array = array;
  }
  array: string[];
}
