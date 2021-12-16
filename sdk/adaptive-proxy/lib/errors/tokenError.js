// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project

/**
 * Indicate that a token is invalid, or a token related operation (e.g. token
 * introspection) has failed.
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class TokenError extends Error {
  /**
   * Create a {@link TokenError} object with a custom error message.
   * @param {string} message The error message.
   */
  constructor(message) {
    super(message);
  }
}

module.exports = TokenError;
