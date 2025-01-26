export interface FirebaseValue<K> {
  docs: {
    data: () => { value: K[] }
  }[];
}
