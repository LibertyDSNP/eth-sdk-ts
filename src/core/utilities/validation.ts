export const isRecord = (obj: unknown): obj is Record<string, unknown> => !!(obj && typeof obj == "object");
export const isString = (obj: unknown): obj is string => !!(obj && typeof obj == "string");
export const isNumber = (obj: unknown): obj is number => !!(obj && typeof obj == "number");
