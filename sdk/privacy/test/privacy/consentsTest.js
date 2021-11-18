// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

const assert = require('assert');
const Env = require('../utils/config');
const config = Env.Config; const auth = Env.Auth; const context = Env.Context;
const checkConfig = Env.checkConfig;
const Privacy = require('../../lib/privacy');

describe('Privacy', () => {
  before(async () => {
    await checkConfig();
  });

  describe('#userConsents', () => {
    it('create user consents', async () => {
      const client = new Privacy(config, auth, context);

      try {
        const result = await client.storeConsents([
          {
            'purposeId': 'marketing',
            'attributeId': 'mobile_number',
            'state': 3,
          },
        ]);
        assert.strictEqual(result.status, 'success',
            `Result status is unexpected: ${result.status}`);
      } catch (error) {
        assert.fail(`Error thrown:\n${error}`);
      }
    });

    it('get user consents', async () => {
      const client = new Privacy(config, auth, context);

      try {
        const result = await client.getUserConsents();
        assert(result.status == 'done',
            `Result status is unexpected: ${result.status}`);
      } catch (error) {
        assert.fail(`Error thrown:\n${error}`);
      }
    });

    it('get user consents for the current application', async () => {
      const client = new Privacy(config, auth, context);

      try {
        const result = await client.getUserConsents(
            {filterByCurrentApplication: true},
        );
        assert.notEqual(result.consents.length, 0);
        for (const consent of result.consents) {
          assert.strictEqual(!!consent.applicationId, true);
        }
      } catch (error) {
        assert.fail(`Error thrown:\n${error}`);
      }
    });

    it('get error because of invalid purpose', async () => {
      const client = new Privacy(config, auth, context);

      try {
        const result = await client.getConsentMetadata([
          {
            'purposeId': 'marketing',
            'attributeId': '11', // mobile_number
            'accessTypeId': 'default',
          },
          {
            'purposeId': '98b56762-398b-4116-94b5-125b5ca0d831',
          },
        ]);

        assert.strictEqual(result.status, 'error',
            `Result status is not unexpected: ${result.status}`);
      } catch (error) {
        assert.fail(`Error thrown:\n${error}`);
      }
    });
  });
  describe('#error', () => {
    describe('storeConsents', async () => {
      it('should return an error for invalid input', async () => {
        const client = new Privacy(config, auth, context);
        const ret = await client.storeConsents({});
        assert.strictEqual(ret.status, 'error');
        assert.strictEqual(ret.error.messageId, 'INVALID_DATATYPE');
      });
    });
    it('should return an error for invalid accesstoken', async () => {
      const client = new Privacy(
          config, {...auth, accessToken: 'someinvalidtoken'}, context,
      );
      const ret = await client.storeConsents([{}]);
      assert.strictEqual(ret.status, 'deny');
    });
    it(`should return failure when an internal user
     poses as an externalSubject`, async () => {
      const client = new Privacy(
          config, auth, {...context, isExternalSubject: true},
      );
      const ret = await client.storeConsents([{
        'purposeId': 'marketing',
        'attributeId': 'mobile_number',
        'state': 3,
      }]);
      assert.strictEqual(ret.status, 'fail');
    });
    describe('getUserConsents', () => {
      it('should return an error for invalid accesstoken', async () => {
        const client = new Privacy(
            config, {...auth, accessToken: 'someinvalidtoken'}, context,
        );
        const ret = await client.getUserConsents();
        assert.strictEqual(ret.status, 'error');
      });
    });
  });
});
