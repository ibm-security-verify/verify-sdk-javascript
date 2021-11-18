// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

const axios = require('axios');
const querystring = require('querystring');

/**
 * Send a HTTP POST request.
 * @param {string} tokenEndpoint The OAuth token endpoint
 * @param {Object} data The POST body to send with the request.
 * @param {Object} params The URL parameters to send with the request.
 * @return {Promise<Object>} The response to the HTTP request.
 */
exports.getToken = async (tokenEndpoint, data = {}, params = {}) => {
  const headers = {
    'Accept': `application/json`,
    'Content-Type': `application/x-www-form-urlencoded`,
  };

  data = querystring.stringify(data);
  const response = await axios.post(tokenEndpoint, data, {params, headers});
  return response.data;
};
