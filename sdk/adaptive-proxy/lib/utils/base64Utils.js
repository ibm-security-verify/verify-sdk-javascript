// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


/**
 * Base64url encode a string.
 * @param {string} string The string to encode.
 * @return {string} The base64url encoded string.
 */
function base64UrlEncodeString(string) {
  return Buffer.from(string).toString('base64')
      // For URL safe base64 (base64url)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
}

/**
 * Base64url encode the JSON string representation of an object.
 * @param {Object} object The object to encode.
* @return {string} The base64url encoded JSON string.
 */
function base64UrlEncodeObject(object) {
  return base64UrlEncodeString(JSON.stringify(object));
}

module.exports = {base64UrlEncodeObject, base64UrlEncodeString};
