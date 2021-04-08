/**
 * Special String Types
 *
 * @packageDocumentation
 */

/**
 * Hexadecimal String
 */
export declare type HexString = string;

/**
 * prefixed Hexadecimal representation of an Ethereum Address
 */
export declare type EthereumAddress = HexString;

/**
 * prefixed Hexadecimal representation of an Ethereum Contract that implements the Social Identity Interface
 */
export declare type SocialIdentityAddress = EthereumAddress;

/**
 * Base64URL encoded String RFC 4648 §5
 */
export declare type Base64UrlString = string;
