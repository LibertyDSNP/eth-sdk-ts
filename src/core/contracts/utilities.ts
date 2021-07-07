/**
 * DomainData represents EIP-712 unique domain
 */
export type TypedDomainData = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
  salt: string;
};

/**
 * TypedData represents EIP-712 complete typed data
 */
export interface TypedData {
  types: Record<string, Array<TypedDataField>>;
  primaryType: string;
  domain: TypedDomainData;
  message: Record<string, unknown>;
}

export type TypedMessageDataField = Record<string, unknown>;

/**
 * EIP712Signature represents a ECDSA r value, s value and EIP-155 calculated Signature v value
 */
export type EIP712Signature = { r: string; s: string; v: number };

/**
 * TypedDataField represents a single type
 */
export interface TypedDataField {
  name: string;
  type: string;
}

const EIP712_DOMAIN_TYPES: TypedDataField[] = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" },
];

/**
 * createTypedData() Allows users to create a JSON-Schema definition for EIP-712 TypedData params.
 *
 * @param domainData - Unique data that identifies a contract to prevent phishing attacks
 * @param primaryType - A top-level type
 * @param message - The message to be signed
 * @param messageTypes - A set of all structured types for messages
 * @returns Typed structured data to be signed
 */
export const createTypedData = (
  domainData: TypedDomainData,
  primaryType: string,
  message: TypedMessageDataField,
  messageTypes: Record<string, Array<TypedDataField>>
): TypedData => {
  return {
    types: {
      EIP712Domain: EIP712_DOMAIN_TYPES,
      ...messageTypes,
    },
    domain: domainData,
    primaryType,
    message,
  };
};
