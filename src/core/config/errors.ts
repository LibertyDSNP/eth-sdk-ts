import { DSNPError } from "../errors";

/**
 * ConfigError indicates that some piece of configuration is not set and that
 * the current action cannot proceed without it.
 */
export class ConfigError extends DSNPError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * MissingSignerConfigError indicates that the signer config is not set.
 */
export class MissingSignerConfigError extends ConfigError {
  constructor() {
    super("Signer is not set.");
  }
}

/**
 * MissingProviderConfigError indicates that the provider config is not set.
 */
export class MissingProviderConfigError extends ConfigError {
  constructor() {
    super("Blockchain provider is not set.");
  }
}

/**
 * MissingStoreConfigError indicates that the store config is not set.
 */
export class MissingStoreConfigError extends ConfigError {
  constructor() {
    super("Store adapter was not found");
  }
}

/**
 * MissingFromIdConfigError indicates that the current from id is missing.
 */
export class MissingFromIdConfigError extends ConfigError {
  constructor() {
    super("No from id found. Please authenticate a handle.");
  }
}
