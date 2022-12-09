// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

const ConfigurationError = require('./errors/configurationError');
const DPCMService = require('./services/dpcm/dpcmService');
const StringUtils = require('./utils/stringUtils');
const debug = require('debug')('verify:privacy');

/**
 * Privacy module is the main module in the Privacy SDK
 * @module Privacy
 */

/**
 * Class representing the Privacy SDK for IBM Security Verify. Used to
 * perform privacy assessment for attributes being requested and metadata
 * required to build consent experiences.
 *
 * @author Vivek Shankar
 */
class Privacy {
  /**
   * Create a new {@link Privacy} object.
   *
   * @param {Object} config Global configuration for the SDK
   * @param {string} config.tenantUrl The Verify tenant hostname, including
   * the protocol.
   * @param {Object} auth Auth object contains property values to authorize
   * requests to Verify
   * @param {string} auth.accessToken The OAuth 2.0 token used to authorize
   * requests. If the access token is generated using a privileged API client
   * (as opposed to one generated on a user authentication flow), the
   * <code>context.subjectId</code> is required.
   * @param {Object} context Context object contains Privacy SDK specific
   * context
   * @param {string} context.subjectId The user/subject identifier that may be
   * a Verify user identifier.
   * @param {boolean} context.isExternalSubject Indicates if the subject is
   * known to Verify.
   * @param {string} context.ipAddress The IP address of the user agent. If this
   * library is used in a backend system, this IP should be obtained from the
   * request headers that contain the actual user agent IP address.
   *
   * @example
   * const Privacy = require('verify-privacy-sdk-js');
   * const client = new Privacy({
   *   "tenantUrl": "https://abc.verify.ibm.com"
   * }, {
   *   "accessToken": "lasfjsdlfjsldjfglsdjfglsjl"
   * }, {
   *   "ipAddress": "1.2.3.4"
   * });
   */
  constructor(config, auth, context = {}) {
    if (!StringUtils.has(config, 'tenantUrl')) {
      throw new ConfigurationError(
          `Cannot find property 'tenantUrl' in configuration settings.`);
    }

    if (!StringUtils.has(auth, 'accessToken')) {
      throw new ConfigurationError(
          `Cannot find property 'accessToken' in auth`);
    }

    this._config = config;
    this._auth = auth;
    this._context = context;
  }

  /**
   * Evaluate the attributes requested for approval.
   *
   * Request the consent management system to approve the use of attributes
   * for the specified purpose, access type and an optional value. If the
   * access type is not specified, it is set to a system default.
   *
   * @param {Array} items The data items that require approval for use
   * @param {string} items.purposeId The purpose ID representing the privacy
   * purpose configured on Verify. If you are checking for the consent status
   * of EULA, use the EULA identifier here.
   * @param {string} items.profileId The Privacy profile ID configured on
   * Verify. If provided, other fields are ignored and assessment is performed
   * using this identifier.
   * @param {string} items.accessTypeId The access type ID representing the
   * available access types on Verify. This must be one of the access types
   * selected for the purpose.
   * @param {string} items.attributeId The attribute ID on Verify. This must be
   * configured as one of the attributes for the purpose. This may be optional
   * if no attributes are configured for the purpose. If this is empty and the
   * purpose has associated attributes, all attributes are assessed and the
   * decision is included in the result array.
   * @param {string} items.attributeValue The attribute value for the attribute.
   * This is typically used when the user has more than one value for the
   * attribute. This is optional.
   *
   * @return {Promise<WrappedAssessment>} The status of the assessment
   * and additional details
   *
   * @example
   * let r = await client.assess([
   *   {
   *     // allow mobile number for marketing
   *     "purposeId": "marketing",
   *     "attributeId": "mobile_number",
   *     "accessTypeId": "default"
   *   },
   *   {
   *     // default end user license agreement
   *     "purposeId": "defaultEULA",
   *   },
   *   {
   *     // Privacy profile identifier
   *     "profileId": "gdprprofile",
   *   }
   * ])
   *
   * if (r.status == "consent") {
   *   // redirect for consent or build the page here
   *   // and render. consider filtering out items
   *   // in the assessment that are not approved because
   *   // of a rule violation
   * } else if (r.status == "approved") {
   *   // the world is your oyster. go forth and conquer
   * } else {
   *   // examine the assessment and show an appropriate error
   * }
   */
  async assess(items) {
    const methodName = `${Privacy.name}:assess(items)`;
    const service = new DPCMService(
        this._auth, this._config.tenantUrl, this._context);
    try {
      const assessment = await service.requestApproval(items);
      debug(`[${methodName}]`, 'assessment:',
          JSON.stringify(assessment));

      // process the response
      if (!Array.isArray(assessment)) {
        const desc = 'assessment is expected to be an array. Received ' +
            `${typeof assessment}`;
        return {
          status: 'error',
          error: {
            'messageId': 'INVALID_DATATYPE',
            'messageDescription': desc,
          },
        };
      }

      let status = await service.processAssessment(assessment);
      if (status == null) {
        // final fallback. shouldn't happen
        status = 'denied';
      }

      return {
        status: status,
        assessment,
      };
    } catch (error) {
      const jsonResp = {status: 'error'};
      if (error.response.data) {
        jsonResp.error = error.response.data;
        debug(`[${methodName}]`, 'error data:', error.response.data);
      } else {
        debug(`[${methodName}]`, 'error:', error);
      }
      return jsonResp;
    }
  }

  /**
   * Get consent metadata that can be used to build the consent page presented
   * to the data subject/user, including the current state of consent.
   *
   * @param {Array} items The data items that require approval for use
   * @param {string} items.purposeId The purpose ID representing the privacy
   * purpose configured on Verify. If you are checking for the consent status
   * of EULA, use the EULA identifier here.
   * @param {string} items.accessTypeId The access type ID representing the
   * available access types on Verify. This must be one of the access types
   * selected for the purpose. If this is not provided in the input, it is
   * defaulted to 'default'. Wildcards are not allowed.
   * @param {string} items.attributeId The attribute ID on Verify. This must be
   * configured as one of the attributes for the purpose. This may be optional
   * if no attributes are configured for the purpose. Wildcards are not allowed.
   * @param {string} items.attributeValue The attribute value for the attribute.
   * This is typically used when the user has more than one value for the
   * attribute. This is optional.
   * @param {Object} headers Optional headers that can be sent
   * @param {string} headers.Accept-Language The locale of content to
   * receive in the response.
   * @return {Promise<WrappedMetadata>} The status of the request
   * and any consent metadata
   *
   * @example
   * let r = await client.getConsentMetadata([
   *   {
   *     // allow mobile number for marketing
   *     "purposeId": "marketing",
   *     "attributeId": "mobile_number",
   *     "accessTypeId": "default"
   *   },
   *   {
   *     // default end user license agreement
   *     "purposeId": "defaultEULA",
   *   }
   * ])
   *
   * if (r.status == "done") {
   *   // render the page based on the r.metadata
   * }
   */
  async getConsentMetadata(items, headers = {}) {
    const methodName = `${Privacy.name}:getConsentMetadata(items)`;
    const service = new DPCMService(this._auth, this._config.tenantUrl,
        this._context, headers);
    try {
      // retrieve the list of purposes
      const purposes = new Set();
      const itemFilter = {};
      for (const item of items) {
        purposes.add(item.purposeId);

        if (!item['accessTypeId'] || item['accessTypeId'] == null) {
          item.accessTypeId = 'default';
        }

        const itemKey = item.purposeId + '/' +
            StringUtils.getOrDefault(item, 'attributeId', '') +
            '.' + StringUtils.getOrDefault(item, 'accessTypeId', '');
        const attrValue = StringUtils.getOrDefault(item, 'attributeValue', '');
        if (!itemFilter.hasOwnProperty(itemKey)) {
          // initialize
          itemFilter[itemKey] = [attrValue];
        } else {
          itemFilter[itemKey].push(attrValue);
        }
      }

      // get metadata
      const response = await service.getConsentMetadata(Array.from(purposes));
      debug(`[${methodName}]`, 'response:', JSON.stringify(response));

      // filter and normalize
      const metadata = await service.processConsentMetadata(
          itemFilter, response);
      debug(`[${methodName}]`, 'metadata:', JSON.stringify(metadata));

      return {status: 'done', metadata};
    } catch (error) {
      const jsonResp = {status: 'error'};
      if (error.response.data) {
        jsonResp.error = error.response.data;
        debug(`[${methodName}]`, 'error data:', error.response.data);
      } else {
        debug(`[${methodName}]`, 'error:', error);
      }
      return jsonResp;
    }
  }

  /**
    * Fetches user consents.
    *
    * @param {Object} options An optional parameter object
    * @param {boolean} options.filterByCurrentApplication If set to true,
    *  filters consentsby the application id present in the authentication token
    * @return {Promise<WrappedGetUserConsents>}
    *
    * @example
    * let r = await client.getUserConsents()
    * if (r.status == "done") {
    *   // render the page based on the r.consents
    * }
    */
  async getUserConsents(options) {
    const methodName = `${Privacy.name}:getUserConsents()`;
    const service = new DPCMService(this._auth, this._config.tenantUrl,
        this._context);
    try {
      const resp = await service.getUserConsents(options);
      debug(`[${methodName}]`, 'response:',
          resp);

      return {status: 'done', consents: resp.consents};
    } catch (error) {
      const jsonResp = {status: 'error'};
      if (error.response && error.response.data) {
        jsonResp.error = error.response.data;
        debug(`[${methodName}]`, 'error data:', error.response.data);
      } else {
        debug(`[${methodName}]`, 'error:', error);
      }
      return jsonResp;
    }
  }

  /**
    * Store consents for the user.
    * <br><br>Consents may only be created typically, except if the consent
    * end time needs to be updated. Only 10 consent operations are allowed
    * at a time.
    *
    * @param {Consent[]} consents The full consent records that need to be
    * created or updated
    *
    * @return {Promise<WrappedStoreUserConsents>} Consent operation response
    * @example
    * let r = await client.storeConsents([
    *   {
    *     "purposeId": "marketing",
    *     "attributeId": "mobile_number",
    *     "state": 3 // opt-in
    *   }
    * ])
    *
    * if (r.status == "success") {
    *   // Warp 11... engage
    * } else {
    *   // loop through the r.results to determine what failed and why
    * }
    */
  async storeConsents(consents) {
    const methodName = `${Privacy.name}:storeConsents(auth, consents)`;
    if (!Array.isArray(consents)) {
      const desc = 'consents are expected to be an array. Received ' +
          `${typeof consents}`;
      return {
        status: 'error',
        error: {
          'messageId': 'INVALID_DATATYPE',
          'messageDescription': desc,
        },
      };
    }
    const service = new DPCMService(this._auth, this._config.tenantUrl,
        this._context);
    try {
      const r = await service.storeConsents(consents);
      debug(`[${methodName}]`, 'response:',
          r);

      // parse the response
      const status = (r.messageId != 'CSIBT0070I') ? 'fail' : 'success';
      return {status: status, results: r.results};
    } catch (error) {
      debug(`[${methodName}]`, 'error:', error);
      const jsonResp = {status: 'deny'};
      if (error.response.data) {
        jsonResp.error = error.response.data;
      }
      return jsonResp;
    }
  }
}

/**
 * Enumeration of different possible consent display types
 * @enum {ConsentDisplayTypesEnum}
 * @readonly
 */
Privacy.ConsentDisplayTypes = {
  DO_NOT_SHOW: 1,
  TRANSPARENT: 2,
  OPTIN_OR_OUT: 3,
  ALLOW_OR_DENY: 4,
};

/**
 * Enumeration of different possible consent types
 * @enum {ConsentTypesEnum}
 * @readonly
 */
Privacy.ConsentTypes = {
  ALLOW: 1,
  DENY: 2,
  OPTIN: 3,
  OPTOUT: 4,
  TRANSPARENT: 5,
};

module.exports = Privacy;
