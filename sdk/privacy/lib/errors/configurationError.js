// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

/**
 * Indicate that a provided configuration does not contain the
 * required configuration properties.
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
