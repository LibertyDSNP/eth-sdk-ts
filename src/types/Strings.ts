/**
 * Special String Types
 *
 * @packageDocumentation
 */

/**
 * 0x prefixed Hexadecimal String
 */
export type HexString = `0x${Lowercase<string>}`;

/**
 * 0x prefixed Hexadecimal representation of an Ethereum Address
 */
export type EthereumAddress = HexString;

/**
 * 0x prefixed Hexadecimal representation of an Ethereum Contract that implements the Social Identity Interface
 */
export type SocialIdentityAddress = EthereumAddress;

/**
 * Base64URL encoded String RFC 4648 §5
 */
export type Base64UrlString = string;
