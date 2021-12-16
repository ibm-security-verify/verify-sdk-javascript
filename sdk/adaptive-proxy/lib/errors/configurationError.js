// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project

/**
 * Indicate that a provided configuration does not contain the
 * <code>tenantUrl</code>, <code>clientId</code>, or <code>clientSecret</code>
 * properties.
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class ConfigurationError extends Error {
  /**
   * Create a {@link ConfigurationError} object with a custom error message.
   * @param {string} message The error message.
   */
  constructor(message) {
    super(message);
  }
}

module.exports = ConfigurationError;
