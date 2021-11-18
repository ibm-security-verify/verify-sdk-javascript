// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

const assert = require('assert');
const Env = require('../utils/config');
const config = Env.Config; const auth = Env.Auth; const context = Env.Context;
const checkConfig = Env.checkConfig;
const DPCMService = require('../../lib/services/dpcm/dpcmService');
const debug = require('debug')('verify:processMetadataTest');

describe('DPCMService', () => {
  before(async () => {
    await checkConfig();
  });

  describe('#flattenDSPResponse', () => {
    it('should flatten correctly', () => {
      const service = new DPCMService(auth, config.tenantUrl, context);
      const itemFilter = {
        'marketing/3.default': [''],
        'marketing/11.default': [''],
        'eula/.default': [''],
        'eula2/.default': [''],
      };
      const response = {
        'purposes': {
          'eula': {
            'id': 'eula',
            'name': 'EULA',
            'version': 3,
            'category': 'eula',
            'accessTypes': [
              {
                'id': 'default',
              },
            ],
          },
          'eula2': {
            'id': 'eula2',
            'name': 'EULA2',
            'version': 1,
            'category': 'eula',
            'accessTypes': [
              {
                'id': 'default',
              },
            ],
          },
          'marketing': {
            'id': 'marketing',
            'name': 'Marketing',
            'version': 2,
            'description': '',
            'state': 1,
            'defaultConsentDuration': 90,
            'previousConsentApply': false,
            'similarToVersion': 2,
            'tags': [
              'verify',
            ],
            'category': 'default',
            'dataCount': 3,
            'accessTypes': [
              {
                'id': 'default',
              },
            ],
            'attributes': [
              {
                'id': '3',
                'mandatory': false,
                'retentionPeriod': 7,
                'accessTypes': [
                  {
                    'id': 'default',
                    'legalCategory': 4,
                    'assentUIDefault': false,
                  },
                ],
              },
              {
                'id': '11',
                'mandatory': false,
                'retentionPeriod': 7,
                'accessTypes': [
                  {
                    'id': 'default',
                    'legalCategory': 4,
                    'assentUIDefault': true,
                  },
                ],
              },
            ],
          },
        },
        'consents': {
          '86126e94-ad8d-4756-9233-5e241d2284c9': {
            'purposeId': 'marketing',
            'purposeVersion': 2,
            'isGlobal': false,
            'applicationId': '1045301010528768009',
            'attributeId': '3',
            'accessTypeId': 'default',
            'geoIP': '103.252.202.125',
            'state': 1,
            'createdTime': 1621778112,
            'lastModifiedTime': 1621778112,
            'startTime': 1621778112,
            'endTime': 1629554112,
            'version': 1,
            'status': 1,
          },
          'eula_consent_1': {
            'purposeId': 'eula2',
            'purposeVersion': 1,
            'isGlobal': true,
            'applicationId': null,
            'attributeId': null,
            'accessTypeId': 'default',
            'geoIP': '103.252.202.125',
            'state': 2,
            'createdTime': 1621778112,
            'lastModifiedTime': 1621778112,
            'startTime': 1621778112,
            'endTime': 1629554112,
            'version': 1,
            'status': 2,
          },
        },
        'accessTypes': {
          'default': {
            'name': 'default',
          },
        },
        'attributes': {
          '3': {
            'name': 'email',
            'description': 'The user\'s work email.',
            'scope': 'global',
            'sourceType': 'schema',
            'datatype': 'string',
            'tags': [
              'sso',
              'prov',
            ],
            'credName': 'email',
            'schemaAttribute': {
              'name': 'mail',
              'attributeName': 'email',
              'scimName': 'emails',
              'customAttribute': false,
            },
            'constraints': {
              'readAccessForEndUser': true,
              'writeAccessForEndUser': true,
              'mandatory': false,
              'unique': false,
            },
          },
          '11': {
            'name': 'mobile_number',
            'description': 'The user\'s mobile phone number.',
            'scope': 'global',
            'sourceType': 'schema',
            'datatype': 'string',
            'tags': [
              'sso',
              'prov',
            ],
            'credName': 'mobile_number',
            'schemaAttribute': {
              'name': 'mobile',
              'attributeName': 'mobile_number',
              'scimName': 'phoneNumbers',
              'customAttribute': false,
            },
            'constraints': {
              'readAccessForEndUser': true,
              'writeAccessForEndUser': true,
              'mandatory': false,
              'unique': false,
            },
          },
        },
      };

      debug(`[processConsentMetadata] ${JSON.stringify(itemFilter)}`);
      service.processConsentMetadata(itemFilter, response).then((result) => {
        debug(`[processConsentMetadata] result:\n${JSON.stringify(result)}`);
      }).catch((err) => {
        debug('Error=' + err);
        assert.fail('processConsentMetadata failed');
      });
    });
  });
});
