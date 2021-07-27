/**
 * createdAtOrNow() optionally takes a createdAt value and either returns the
 * given date number or if no createdAt is provided, returns the current time as
 * milliseconds since the UNIX epoch.
 *
 * @param createdAt - Optional. The createdAt value to return
 * @returns The number of milliseconds since the UNIX epoch to the specified date
 */
export const createdAtOrNow = (createdAt?: number): number => createdAt || new Date().getTime();
