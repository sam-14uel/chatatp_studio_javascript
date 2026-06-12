/**
 * Wraps an array result into an async-iterable page.
 * As the API adds cursor-based pagination, this class can be extended
 * to fetch subsequent pages automatically.
 */
export class PageIterator<T> implements AsyncIterable<T> {
  readonly data: T[];

  constructor(data: T[]) {
    this.data = data;
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    let index = 0;
    const data = this.data;
    return {
      async next() {
        if (index < data.length) {
          return { value: data[index++], done: false };
        }
        return { value: undefined as unknown as T, done: true };
      },
    };
  }

  /** Collect remaining items into an array */
  async toArray(): Promise<T[]> {
    return [...this.data];
  }
}
