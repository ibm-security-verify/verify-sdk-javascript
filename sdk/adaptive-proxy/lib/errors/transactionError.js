// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project

/**
 * Indicate that a transaction associated to the provided transaction ID does
 * not exist, or the transaction does not contain a required property.
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class TransactionError extends Error {
  /**
   * Create a {@link TransactionError} object with a custom error message.
   * @param {string} message The error message.
   */
  constructor(message) {
    super(message);
  }
}

module.exports = TransactionError;
