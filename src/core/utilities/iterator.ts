/**
 * AsyncOrSyncIterable is an AsyncIterable or an Iterable
 */
export type AsyncOrSyncIterable<T> = AsyncIterable<T> | Iterable<T>;

/**
 * filterIterable takes an iterable and a filter function and returns an async
 * iterable over only the items in the original iterable which satisfy the
 * filter function.
 *
 * @param iterable - An async iterable or iterable to filter
 * @param filterFunc - The function with which to filter
 * @returns A new async iterable over all items in the original iterable satisfying the filter function
 */
export async function* filterIterable<T>(
  iterable: AsyncOrSyncIterable<T>,
  filterFunc: (obj: T) => boolean
): AsyncIterable<T> {
  for await (const item of iterable) {
    if (filterFunc(item)) yield item;
  }
}
