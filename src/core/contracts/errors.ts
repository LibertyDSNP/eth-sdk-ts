import { DSNPUserURI } from "../identifiers";
import { DSNPError } from "../errors";

/**
 * ContractError indicates that an error occurred in the contracts module.
 */
export class ContractError extends DSNPError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * MissingContractAddressError indicates that a contract address could not be
 * found either on the chain or in the configuration overrides.
 */
export class MissingContractAddressError extends ContractError {
  contractName: string;

  constructor(contractName: string) {
    super(`Could not find address for ${contractName} contract.`);
    this.contractName = contractName;
  }
}

/**
 * MissingRegistrationError indicates that the registration for a given
 * DSNP User URI could not be found.
 */
export class MissingRegistrationError extends ContractError {
  dsnpUserURI: DSNPUserURI;

  constructor(dsnpUserURI: DSNPUserURI) {
    super(`Could not find registration for user: ${dsnpUserURI}.`);
    this.dsnpUserURI = dsnpUserURI;
  }
}

/**
 * NoLogsFoundContractError indicates that a log event could not be found.
 */
export class NoLogsFoundContractError extends ContractError {
  eventName: string;

  constructor(eventName: string) {
    super(`Could not find log event: ${eventName}.`);
    this.eventName = eventName;
  }
}

/**
 * InvalidAnnouncementParameterError indicates that something other than an
 * announcement was passed as an announcement.
 */
export class InvalidAnnouncementParameterError extends ContractError {
  constructor(announcement: unknown) {
    super(`Invalid announcement parameter: ${announcement}.`);
  }
}
