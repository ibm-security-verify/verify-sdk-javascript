// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

const assert = require('assert');
const Env = require('../utils/config');
const config = Env.Config; const auth = Env.Auth; const context = Env.Context;
const checkConfig = Env.checkConfig;
const Privacy = require('../../lib/privacy');

describe('Privacy', () => {
  before( async () => {
    await checkConfig();

    // precreate some consents
    const client = new Privacy(config, auth, context);
    await client.storeConsents([
      {
        // Consent with attribute value
        'purposeId': 'profilemgmt',
        'attributeId': 'mobile_number',
        'attributeValue': '+651234567',
        'accessTypeId': 'read',
        'state': 3,
      },
      {
        // Consent without attribute value
        'purposeId': 'profilemgmt',
        'attributeId': 'given_name',
        'accessTypeId': 'read',
        'state': 3,
      },
      {
        // Consent that is in the future
        'purposeId': 'profilemgmt',
        'attributeId': 'display_name',
        'accessTypeId': 'read',
        'state': 3,
        'startTime': 1749508768,
      },
      {
        // Opt out
        'purposeId': 'profilemgmt',
        'attributeId': 'family_name',
        'accessTypeId': 'read',
        'state': 4,
      },
    ]);
  });

  describe('#consentMetadata', () => {
    it('get some metadata', async () => {
      const client = new Privacy(config, auth, context);

      const result = await client.getConsentMetadata([
        {
          'purposeId': 'profilemgmt',
          'attributeId': 'given_name',
          'accessTypeId': 'read',
        },
      ]);

      assert.strictEqual(result.status, 'done',
          `Result status is not done: ${result.status}`);
    });

    it('get error because of invalid purpose', async () => {
      const client = new Privacy(config, auth, context);

      const result = await client.getConsentMetadata([
        {
          'purposeId': 'marketing',
          'attributeId': 'given_name',
          'accessTypeId': 'default',
        },
        {
          'purposeId': '98b56762-398b-4116-94b5-125b5ca0d831',
        },
      ], {'Accept-Language': 'fr'});

      assert.strictEqual(result.status, 'error',
          `Result status is not done: ${result.status}`);
      assert.strictEqual(
          result.error.messageDescription.startsWith('Le mappage de'),
          true,
          'Error message is not in desired locale',
      );
    });

    it('deep test', async () => {
      const client = new Privacy(config, auth, context);

      const result = await client.getConsentMetadata([
        {
          'purposeId': 'profilemgmt',
          'attributeId': 'given_name',
          'accessTypeId': 'read',
        },
        {
          'purposeId': 'profilemgmt',
          'attributeId': 'mobile_number',
          'attributeValue': '+6598786',
          'accessTypeId': 'read',
        },
        {
          'purposeId': 'profilemgmt',
          'attributeId': 'mobile_number',
          'attributeValue': '+651234567',
          'accessTypeId': 'read',
        },
        {
          'purposeId': 'profilemgmt',
          'attributeId': 'display_name',
          'accessTypeId': 'read',
        },
      ]);

      assert.strictEqual(result.status, 'done',
          `Result status is not done: ${result.status}`);
      assert.strictEqual(result.metadata.default.length, 4,
          `Expected 4 default metadata records`);
      const expectedResultMap = {
        'profilemgmt/6.read#': {
          status: 'ACTIVE',
        },
        'profilemgmt/11.read#+6598786': {
          status: 'NONE',
        },
        'profilemgmt/11.read#+651234567': {
          status: 'ACTIVE',
        },
        'profilemgmt/19.read#': {
          status: 'NOT_ACTIVE',
        },
      };

      for (const record of result.metadata.default) {
        const attrValue = (record.attributeValue != null) ?
            record.attributeValue : '';
        const key = record.purposeId + '/' + record.attributeId +
            '.' + record.accessTypeId + '#' +
            attrValue;

        assert.strictEqual(record['status'], expectedResultMap[key].status,
            `Fail: ${JSON.stringify(record)}`);
      }
    });

    describe('#error', () => {
      it(`should fail to retrieve metadata if isExternalSubject
      is specified incorrectly`, async () => {
        const client = new Privacy(
            config, auth, {...context, isExternalSubject: true},
        );
        const result = await client.getConsentMetadata([
          {
            'purposeId': 'marketing',
            'attributeId': 'given_name',
            'accessTypeId': 'default',
          },
        ]);
        assert.strictEqual(result.status, 'error');
        assert.strictEqual(result.error.messageId, 'CSIBT0004E');
      });
    });
  });
});
