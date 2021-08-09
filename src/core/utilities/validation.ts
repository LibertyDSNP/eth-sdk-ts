/**
 * isRecord is a type check for records
 *
 * @param obj - The object to test
 * @returns True if the object is a record, otherwise false
 */
export const isRecord = (obj: unknown): obj is Record<string, unknown> => typeof obj == "object";

/**
 * isString is a type check for records
 *
 * @param obj - The object to test
 * @returns True if the object is a string, otherwise false
 */
export const isString = (obj: unknown): obj is string => typeof obj == "string";

/**
 * isNumber is a type check for records
 *
 * @param obj - The object to test
 * @returns True if the object is a number, otherwise false
 */
export const isNumber = (obj: unknown): obj is number => typeof obj == "number";

/**
 * isArrayOfType
 *
 * @param obj - The object to test
 * @param typeCheck - The type check function to validate items in the array
 * @returns True if the object is an array matching the type check, otherwise false
 */
export const isArrayOfType = <T>(obj: unknown, typeCheck: (subobj: unknown) => subobj is T): obj is Array<T> => {
  if (!Array.isArray(obj)) return false;

  for (const item of obj) {
    if (!typeCheck(item)) return false;
  }

  return true;
};
