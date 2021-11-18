// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

const assert = require('assert');
const Env = require('../utils/config');
const config = Env.Config; const auth = Env.Auth; const context = Env.Context;
const checkConfig = Env.checkConfig;
const Privacy = require('../../lib/privacy');
const debug = require('debug')('verify:assessTest');
const ConfigurationError = require('../../lib/errors/configurationError');

describe('Privacy', () => {
  before(async () => {
    await checkConfig();
  });

  describe('#assess', () => {
    it('should not be approved', async () => {
      const client = new Privacy(config, auth, context);

      try {
        const result = await client.assess([
          {
            'purposeId': 'marketing',
            'attributeId': 'email',
            'accessTypeId': 'default',
          },
        ]);

        debug(`result =\n${JSON.stringify(result)}`);
        assert.strictEqual(result.status, 'consent',
            `Result status is not consent: ${result.status}`);
        assert.ok(result.assessment[0].purposeId == 'marketing',
            'Purpose ID in the response does not match');
        assert.ok(!result.assessment[0].result[0].approved,
            'Request is approved. This is unexpected');
      } catch (error) {
        assert.fail(`Error thrown:\n${error}`);
      }
    });

    it('should be denied', async () => {
      const client = new Privacy(config, auth, context);

      try {
        const result = await client.assess([
          {
            'purposeId': '98b56762-398b-4116-94b5-125b5ca0d831',
          },
        ]);
        debug(`result =\n${JSON.stringify(result)}`);
        const purposeId = '98b56762-398b-4116-94b5-125b5ca0d831';
        assert.strictEqual(result.status, 'denied',
            `Result status is not done: ${result.status}`);
        assert.ok(result.assessment[0].purposeId == purposeId,
            'Purpose ID in the response does not match');
        assert.ok(!result.assessment[0].result[0].approved,
            'Request is approved. This is unexpected');
      } catch (error) {
        assert.fail(`Error thrown:\n${error}`);
      }
    });

    it('should ask for consent though one result is denied', async () => {
      const client = new Privacy(config, auth, context);

      try {
        const result = await client.assess([
          {
            'purposeId': 'marketing',
            'attributeId': 'email',
            'accessTypeId': 'default',
          },
          {
            'purposeId': '98b56762-398b-4116-94b5-125b5ca0d831',
          },
        ]);

        debug(`result =\n${JSON.stringify(result)}`);
        assert.strictEqual(result.status, 'consent',
            `Result status is not done: ${result.status}`);
        assert.ok(result.assessment[0].purposeId == 'marketing',
            'Purpose ID in the response does not match');
        assert.ok(!result.assessment[0].result[0].approved,
            'Request is approved. This is unexpected');
      } catch (error) {
        assert.fail(`Error thrown:\n${error}`);
      }
    });

    it('badeula', async () => {
      const client = new Privacy(config, auth, context);

      const result = await client.assess([
        {
          'purposeId': 'badeula',
        },
      ]);

      debug(`result =\n${JSON.stringify(result)}`);
      assert.strictEqual(result.status, 'denied',
          `Result status is not error: ${JSON.stringify(result)}`);
    });

    it('should show multistatus when assessment ' +
      'contains both approved and denied', async () => {
      const client = new Privacy(config, auth, context);
      const promises = [];
      promises.push(client.assess([
        {
          'purposeId': 'invalidpurpose',
          'attributeId': 'email',
          'accessTypeId': 'default',
        },
        {
          'purposeId': 'marketing',
          'attributeId': 'mobile_number',
          'accessTypeId': 'default',
        },
      ]));
      promises.push(client.assess([
        {
          'purposeId': 'marketing',
          'attributeId': 'mobile_number',
          'accessTypeId': 'default',
        },
        {
          'purposeId': 'invalidpurpose',
          'attributeId': 'email',
          'accessTypeId': 'default',
        },
      ]));
      const results = await Promise.all(promises);
      assert.strictEqual(results[0].status, 'multistatus');
      assert.strictEqual(results[1].status, 'multistatus');
    });

    it('should implicitly infer subjectId from token' +
    ' if unspecified', async () => {
      const client = new Privacy(
          config, auth, {...context, subjectId: undefined},
      );
      const result = await client.assess([
        {
          'purposeId': 'marketing',
          'attributeId': 'email',
          'accessTypeId': 'default',
        },
      ]);
      assert.strictEqual(result.status, 'consent');
    });

    it('should implicitly infer ipAddress from token' +
    ' if unspecified', async () => {
      const client = new Privacy(
          config, auth, {...context, ipAddress: undefined},
      );
      const result = await client.assess([
        {
          'purposeId': 'marketing',
          'attributeId': 'email',
          'accessTypeId': 'default',
        },
      ]);
      assert.strictEqual(result.status, 'consent');
    });
  });

  describe('#error', () => {
    describe('constructor', () => {
      it('should throw if tenantUrl is empty or not specified', () => {
        try {
          new Privacy({...config, tenantUrl: ''}, auth, context);
          assert.fail('should throw ConfigurationError');
        } catch (err) {
          assert.strictEqual(err instanceof ConfigurationError, true);
        }
      });
      it('should throw if accessToken is empty or not specified', () => {
        try {
          new Privacy(config, {...auth, accessToken: ''}, auth, context);
          assert.fail('should throw ConfigurationError');
        } catch (err) {
          assert.strictEqual(err instanceof ConfigurationError, true);
        }
      });
    });
    describe('assess', async () => {
      it('should return an error if input is not an array', async () => {
        const client = new Privacy(config, auth, context);
        const ret = await client.assess({});
        assert.strictEqual(ret.status, 'error');
        assert.strictEqual(ret.error.messageId, 'CSIBT0004E');
      });
      it(`should return error if isExternalSubject
        is specified incorrectly`, async () => {
        const client = new Privacy(
            config, auth, {...context, isExternalSubject: true},
        );
        const result = await client.assess([
          {
            'purposeId': 'marketing',
            'attributeId': 'email',
            'accessTypeId': 'default',
          },
        ]);
        assert.strictEqual(result.status, 'error');
      });
    });
  });
});
