/**
 * sortObject() takes a javascript object and returns a copy of the object with
 * all keys sorted recursively. This method is intended to be used to guarantee
 * that objects intended be JSON stringified always produce a consistent JSON
 * string, since implementations of [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#issue_with_plain_json.stringify_for_use_as_javascript)
 * do not necessarily guarantee key order.
 *
 * @param obj - The object to recursively sort
 * @returns A sorted copy of the given object
 */
export const sortObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  Object.keys(obj)
    .sort()
    .forEach((key) => {
      if (typeof obj[key] == "object") {
        result[key] = sortObject(obj[key] as Record<string, unknown>);
      } else {
        result[key] = obj[key];
      }
    });

  return result;
};
