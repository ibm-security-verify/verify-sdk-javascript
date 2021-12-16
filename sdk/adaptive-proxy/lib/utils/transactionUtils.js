// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const TransactionError = require('../errors/transactionError');

const NodeCache = require('node-cache');
const {v4: uuid} = require('uuid');


// Initialise a cache with 10-minute storage.
const cache = new NodeCache({stdTTL: 600});

/**
 * Create a stored transaction. Associate the given object with a random UUID in
 * the cache.
 * @param {Object} object The object to store as a transaction.
 * @return {string} The randomly generated UUID associated to the new
 * transaction.
 * @throws {TransactionError} The transaction cannot be stored.
 */
function createTransaction(object) {
  const transactionId = uuid();
  if (!cache.set(transactionId, object)) {
    throw new TransactionError(
        `Could not create transaction with ID ${transactionId}.`);
  }

  console.log(`[transactionUtils:createTransaction(object)]`,
      'transactionId:', transactionId);
  console.log(`[transactionUtils:createTransaction(object)]`,
      'transaction:', object);

  return transactionId;
}

/**
 * Get a stored transaction.
 * @param {string} transactionId The identifier of the transaction.
 * @return {Object} The transaction object associated with the identifier.
 * @throws {TransactionError} The transaction ID doesn't exist.
 */
function getTransaction(transactionId) {
  const transaction = cache.get(transactionId);
  if (!transaction) {
    throw new TransactionError('Invalid transaction ID provided.');
  }

  console.log(`[transactionUtils:getTransaction(transactionId)]`,
      'transactionId:', transactionId);
  console.log(`[transactionUtils:getTransaction(transactionId)]`,
      'transaction:', transaction);

  return transaction;
}

/**
 * Add the given properties to a stored transaction.
 * @param {string} transactionId The identifier of the transaction to update.
 * @param {Object} properties The properties to add to the transaction.
 * @throws {TransactionError} The transaction ID doesn't exist.
 */
function updateTransaction(transactionId, properties) {
  const oldTransaction = cache.get(transactionId);
  if (!oldTransaction) {
    throw new TransactionError('Invalid transaction ID provided.');
  }
  const newTransaction = {...oldTransaction, ...properties};

  console.log(`[transactionUtils:updateTransaction(transactionId, properties)]`,
      'transactionId:', transactionId);
  console.log(`[transactionUtils:updateTransaction(transactionId, properties)]`,
      'oldTransaction:', oldTransaction);
  console.log(`[transactionUtils:updateTransaction(transactionId, properties)]`,
      'newTransaction:', newTransaction);

  cache.set(transactionId, newTransaction);
}

/**
 * Delete a stored transaction.
 * @param {string} transactionId The identifier of the transaction to delete.
 * @throws {TransactionError} The transaction ID doesn't exist.
 */
function deleteTransaction(transactionId) {
  if (cache.del(transactionId) !== 1) {
    throw new TransactionError('Invalid transaction ID provided.');
  }

  console.log(`[transactionUtils:deleteTransaction(transactionId)]`,
      'transactionId:', transactionId);
}

module.exports = {createTransaction, updateTransaction, getTransaction,
  deleteTransaction};
