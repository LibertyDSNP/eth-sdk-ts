/**
 * Simple Encryption Formats
 *
 * @packageDocumentation
 */
import { Base64UrlString, HexString } from "./Strings";

export type KeyTypes = "xsalsa20" | "x25519";
export type Algorithms = "x25519-xsalsa20-poly1305" | "xsalsa20-poly1305";

/**
 * Simple Encrypted Message x25519-xsalsa20-poly1305
 */
export declare interface SEMx25519 {
  /** Ciphertext */
  c: Base64UrlString;
  /** Ephemeral Public Key */
  e: Base64UrlString;
  /** Key Identifier */
  k: string;
  /** Nonce */
  n: Base64UrlString;
  /** Algorithm Version = x25519-xsalsa20-poly1305 */
  v: "x25519-xsalsa20-poly1305";
}

/**
 * Simple Encrypted Message xsalsa20-poly1305
 */
export declare interface SEMxSalsa20 {
  /** Ciphertext */
  c: Base64UrlString;
  /** Key Identifier */
  k?: string;
  /** Nonce */
  n: Base64UrlString;
  /** Algorithm Version = xsalsa20-poly1305 */
  v: "xsalsa20-poly1305";
}

export declare type SimpleEncryptedMessage = SEMx25519 | SEMxSalsa20;

/**
 * Simple Key Format for the x25519 Curve
 */
interface SKFx25519Base {
  /** Public Key (Optional) */
  x?: Base64UrlString;
  /** Private Key (Optional) */
  d?: Base64UrlString;
  /** Key Type = x25519 */
  t: "x25519";
  /** Key Identifier */
  k?: string;
}

export type SKFx25519 = SKFx25519WithPrivate | SKFx25519WithPublic;

export interface SKFx25519WithPrivate extends SKFx25519Base {
  /** Private Key */
  d: Base64UrlString;
}

export interface SKFx25519WithPublic extends SKFx25519Base {
  /** Public Key */
  x: Base64UrlString;
}

/**
 * Wrapped Simple Encrypted Message
 */
export interface WrappedSEM {
  /** Authentication Tag */
  // a: Base64UrlString;
  /** Ciphertext */
  c: Base64UrlString;
  /** Nonce */
  n?: Base64UrlString;
  /** Algorithm Version */
  v: Algorithms;
  /** Key Wrapping Array */
  w: SimpleEncryptedMessage[];
  /** Wrapped Key Type */
  t: KeyTypes;
}

export interface WrappedSEMxSalsa20 extends WrappedSEM {
  /** Nonce (required) */
  n: Base64UrlString;
  /** Wrapped Key Type = xsalsa20 */
  t: "xsalsa20";
  /** Algorithm Version = xsalsa20-poly1305 */
  v: "xsalsa20-poly1305";
}

/**
 * Simple Key Format for Symmetric xsalsa20
 */
export interface SKFxSalsa20 {
  /** The Symmetric Key */
  x: Base64UrlString; // Public or Symmetric Key
  /** Key Type = xsalsa20 */
  t: "xsalsa20"; // Key type
  /** Key Identifier */
  k?: string; // Key Id
}

export type SimpleKeyFormat = SKFx25519 | SKFx25519WithPrivate | SKFx25519WithPublic | SKFxSalsa20;

/**
 * Compressed SEM is a Inflate Raw compressed hex string that inflates into a JSON stringified [[SimpleEncryptedMessage]]
 */
export type CompressedSEM = HexString;

/**
 * Public Keys can come in various formats and still be valid
 */
export type PublicKey = SKFx25519 | HexString | Base64UrlString;
