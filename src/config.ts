import * as config from "./core/config";

/**
 * getConfig() fetches the current configuration settings and returns them.
 *
 * @param overrides - Config overrides for this request
 * @returns The current configuration settings with ConfigOpts as overrides.
 */
export const getConfig = (overrides?: config.ConfigOpts): config.Config => {
  if (!overrides) return config.getConfig();

  return {
    ...config.getConfig(),
    ...overrides,
    contracts: { ...config.getConfig().contracts, ...overrides.contracts },
  };
};

/**
 * setConfig() sets the current configuration with the given object. Any keys
 * previously set on the config object will not be removed. To remove a config
 * option, this method should be called with undefined passed for the given key
 * to override it.
 *
 * @param newConfig - The configuration settings to set with
 * @returns The newly constructed config
 */
export const setConfig = (newConfig: config.ConfigOpts): config.Config => {
  const { signer, provider } = newConfig;
  if (provider && signer && !signer.provider) newConfig.signer = signer.connect(provider);
  config.setConfig({
    ...config.getConfig(),
    ...newConfig,
  });
  return config.getConfig();
};
