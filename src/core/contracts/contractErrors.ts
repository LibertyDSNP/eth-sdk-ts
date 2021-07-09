import { DSNPError } from "../errors";

/**
 * ContractError indicates that an error occurred in the contracts module.
 */
export class ContractError extends DSNPError {
  constructor(message: string) {
    super(message);
    this.name = "ContractError";
  }
}

/**
 * MissingContractAddressError indicates that a contract address could not be
 * found either on the chain or in the configuration overrides.
 */
export class MissingContractAddressError extends ContractError {
  constructor(contractName: string) {
    super(`Could not find address for ${contractName} contract.`);
    this.name = "MissingContractAddressError";
  }
}

/**
 * MissingRegistrationContractError indicates that the registration for a given
 * DSNP User Id could not be found.
 */
export class MissingRegistrationContractError extends ContractError {
  constructor(dsnpUserId: string) {
    super(`Could not find registration for user id ${dsnpUserId}.`);
    this.name = "MissingRegistrationContractError";
  }
}
