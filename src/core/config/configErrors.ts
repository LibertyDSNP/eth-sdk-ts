import { DSNPError } from "../errors";

/**
 * ConfigError indicates that some piece of configuration is not set and that
 * the current action cannot proceed without it.
 */
export class ConfigError extends DSNPError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/**
 * MissingSignerConfigError indicates that the signer config is not set.
 */
export class MissingSignerConfigError extends ConfigError {
  constructor() {
    super("Signer is not set.");
    this.name = "MissingSignerConfigError";
  }
}

/**
 * MissingProviderConfigError indicates that the provider config is not set.
 */
export class MissingProviderConfigError extends ConfigError {
  constructor() {
    super("Blockchain provider is not set.");
    this.name = "MissingProviderConfigError";
  }
}

/**
 * MissingStoreConfigError indicates that the store config is not set.
 */
export class MissingStoreConfigError extends ConfigError {
  constructor() {
    super("Store adapter was not found");
    this.name = "MissingStoreConfigError";
  }
}

/**
 * MissingFromIdConfigError indicates that the current from id is missing.
 */
export class MissingFromIdConfigError extends ConfigError {
  constructor() {
    super("No from id found. Please authenticate a handle.");
    this.name = "MissingUFromIdConfigError";
  }
}
