// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const assert = require('assert');
const transactionUtils = require('../lib/utils/transactionUtils');


describe('transactionUtils', () => {
  describe('#createTransaction', () => {
    it('should return a random UUID after creating a transaction', () => {
      const transaction = {message: 'Hello, world!'};
      const transactionId = transactionUtils.createTransaction(transaction);

      assert.notEqual(transactionId, undefined);
    });
  });

  describe('#getTransaction', () => {
    it('should return a transaction when passed a valid transaction ID', () => {
      const transaction = {message: 'Hello, world!'};
      const transactionId = transactionUtils.createTransaction(transaction);

      assert.deepEqual(transactionUtils.getTransaction(transactionId),
          transaction);
    });

    it('should throw an error when passed an invalid transaction ID', () => {
      const transactionId = '00000000-0000-0000-0000-000000000000';

      assert.throws(() => transactionUtils.getTransaction(transactionId));
    });
  });

  describe('#updateTransaction', () => {
    it('should add a property to an existing transaction', () => {
      const transaction = {message1: 'Hello'};
      const transactionId = transactionUtils.createTransaction(transaction);

      transactionUtils.updateTransaction(transactionId, {message2: 'world!'});
      assert.deepEqual(transactionUtils.getTransaction(transactionId),
          {message1: 'Hello', message2: 'world!'});
    });

    it('should update a property of an existing transaction', () => {
      const transaction = {message: 'Hello, world!'};
      const transactionId = transactionUtils.createTransaction(transaction);

      transactionUtils.updateTransaction(transactionId, {message: 'Hello!'});
      assert.deepEqual(transactionUtils.getTransaction(transactionId),
          {message: 'Hello!'});
    });

    it('should throw an error when passed an invalid transaction ID', () => {
      const transactionId = '00000000-0000-0000-0000-000000000000';

      assert.throws(() => transactionUtils.updateTransaction(transactionId,
          {message: 'Hello!'}));
    });
  });

  describe('#deleteTransaction', () => {
    it('should delete a transaction when passed a valid transaction ID', () => {
      const transaction = {message: 'Hello, world!'};
      const transactionId = transactionUtils.createTransaction(transaction);

      assert.deepEqual(transactionUtils.getTransaction(transactionId),
          {message: 'Hello, world!'});
      transactionUtils.deleteTransaction(transactionId);
      assert.throws(() => transactionUtils.getTransaction(transactionId));
    });

    it('should throw an error when passed an invalid transaction ID', () => {
      const transactionId = '00000000-0000-0000-0000-000000000000';

      assert.throws(() => transactionUtils.deleteTransaction(transactionId));
    });
  });
});
