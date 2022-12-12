// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

const axios = require('axios');
const querystring = require('querystring');
const securityUtils = require('../utils/securityUtils');
const debug = require('debug')('verify:service');

/**
 * A class for making HTTP requests to OIDC.
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class Service {
  /**
    * Create a new {@link Service} object.
    * @param {Object} auth The credentials to authorize requests.
    * Only an <code>accessToken</code> may be used at the moment. The
    * requests are further constrained by the entitlements on the token.
    * @param {string} [auth.accessToken] The access token to authorize
    * the request.
    * @param {string} baseURL The base URL for the API, normally the tenant URL.
    * @param {Object} context The context to include in the request.
    * @param {string} context.subjectId The user/subject identifier that
    * may be a Verify user identifier.
    * @param {boolean} context.isExternalSubject Indicates if the subject
    * is known to Verify.
    * @param {string} context.ipAddress The IP address of the user agent.
    * If this library is used in a backend system, this IP should be obtained
    * from the request headers that contain the actual user agent IP address.
    * @param {string} [contentTypeHeader='json'] The type of content to send in
    * the requests. Sets the <code>Content-Type</code> header of the requests
    * appropriately.
    * @param {string} [acceptHeader='json'] The type of content to receive
    * in the response. Sets the <code>Accept</code> header of the requests
    * appropriately.
    * @param {string} [acceptLanguageHeader='en-US'] The locale of content to
    * receive in the response. Sets the <code>Accept-Language</code> header of
    * the requests appropriately. If not provided, server responds with it's
    * default setting.
    */
  constructor(auth, baseURL, context, contentTypeHeader = 'json',
      acceptHeader = 'json', acceptLanguageHeader = '') {
    this._baseURL = baseURL;
    this._contentTypeHeader = contentTypeHeader;
    this._acceptHeader = acceptHeader;
    this._acceptLanguageHeader = acceptLanguageHeader;
    this._context = context;
    this._context.subjectId = (this._context.subjectId &&
        this._context.subjectId != '') ? this._context.subjectId : null;
    this._context.isExternalSubject = (this._context.isExternalSubject) ?
        this._context.isExternalSubject : false;
    this._context.ipAddress = (this._context.ipAddress &&
        this._context.ipAddress != '') ? this._context.ipAddress : null;

    this._authorizationHeader = `Bearer ${auth.accessToken}`;

    debug(`[${Service.name}:constructor(auth, baseURL, context, ` +
            `contentTypeHeader='json', acceptHeader='json')]`,
    'baseURL:', this._baseURL);
    debug(`[${Service.name}:constructor(auth, baseURL, context, ` +
            `contentTypeHeader='json', acceptHeader='json')]`,
    'context:', this._context);
    debug(`[${Service.name}:constructor(auth, baseURL, context, ` +
            `contentTypeHeader='json', acceptHeader='json')]`,
    'contentTypeHeader:', this._contentTypeHeader);
    debug(`[${Service.name}:constructor(auth, baseURL, context, ` +
            `contentTypeHeader='json', acceptHeader='json')]`,
    'acceptHeader:', this._acceptHeader);
    debug(`[${Service.name}:constructor(auth, baseURL, context, ` +
            `contentTypeHeader='json', acceptHeader='json')]`,
    'authorizationHeader:', '****');
  }

  /**
    * Send a HTTP GET request.
    * @param {string} path The path on the base URL to send the request to.
    * @param {Object} params The URL parameters to be sent with the request.
    * @return {Promise<Object>} The response to the HTTP request.
    */
  async get(path, params = {}) {
    const headers = {
      'Accept': `application/${this._acceptHeader}`,
      'Accept-Language':
        this._acceptLanguageHeader ? this._acceptLanguageHeader : null,
      'Authorization': this._authorizationHeader,
    };

    debug(`[${Service.name}:get(path, params={})]`,
        'path:', path);
    debug(`[${Service.name}:get(path, params={})]`,
        'params:', securityUtils.maskObject(params));
    debug(`[${Service.name}:get(path, params={})]`,
        'headers:', securityUtils.maskObject(headers));

    return await axios.get(this._baseURL + path, {params, headers});
  }

  /**
    * Send a HTTP POST request.
    * @param {string} path The path on the base URL to send the request to.
    * @param {Object} data The POST body to send with the request.
    * @param {Object} params The URL parameters to send with the request.
    * @return {Promise<Object>} The response to the HTTP request.
    */
  async post(path, data = {}, params = {}) {
    const headers = {
      'Accept': `application/${this._acceptHeader}`,
      'Accept-Language':
        this._acceptLanguageHeader ? this._acceptLanguageHeader : null,
      'Content-Type': `application/${this._contentTypeHeader}`,
      'Authorization': this._authorizationHeader,
    };

    let dataMasked = securityUtils.maskObject(data);

    if (this._contentTypeHeader === 'x-www-form-urlencoded') {
      data = querystring.stringify(data);
      dataMasked = querystring.stringify(dataMasked);
    }

    debug(`[${Service.name}:post(path, data={}, params={})]`,
        'path:', path);
    debug(`[${Service.name}:post(path, data={}, params={})]`,
        'data:', dataMasked);
    debug(`[${Service.name}:post(path, data={}, params={})]`,
        'params:', securityUtils.maskObject(params));
    debug(`[${Service.name}:post(path, data={}, params={})]`,
        'headers:', securityUtils.maskObject(headers));

    return await axios.post(this._baseURL + path, data, {params, headers});
  }

  /**
    * Send a HTTP PATCH request.
    * @param {string} path The path on the base URL to send the request to.
    * @param {Object} data The POST body to send with the request.
    * @param {Object} params The URL parameters to send with the request.
    * @return {Promise<Object>} The response to the HTTP request.
    */
  async patch(path, data = {}, params = {}) {
    const headers = {
      'Accept': `application/${this._acceptHeader}`,
      'Accept-Language':
        this._acceptLanguageHeader ? this._acceptLanguageHeader : null,
      'Content-Type': `application/${this._contentTypeHeader}`,
      'Authorization': this._authorizationHeader,
    };

    let dataMasked = securityUtils.maskObject(data);

    if (this._contentTypeHeader === 'x-www-form-urlencoded') {
      data = querystring.stringify(data);
      dataMasked = querystring.stringify(dataMasked);
    }

    debug(`[${Service.name}:patch(path, data={}, params={})]`,
        'path:', path);
    debug(`[${Service.name}:patch(path, data={}, params={})]`,
        'data:', dataMasked);
    debug(`[${Service.name}:patch(path, data={}, params={})]`,
        'params:', securityUtils.maskObject(params));
    debug(`[${Service.name}:patch(path, data={}, params={})]`,
        'headers:', securityUtils.maskObject(headers));

    return await axios.patch(this._baseURL + path, data, {params, headers});
  }
}

module.exports = Service;
