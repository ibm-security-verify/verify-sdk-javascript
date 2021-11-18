// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

/**
 * Mask sensitive properties of an object.
 * @param {Object} object The object whose sensitive properties to mask.
 * @return {Object} The masked object.
 */
function maskObject(object) {
  const sensitiveProperties = ['password', 'otp', 'Authorization', 'assertion',
    'token', 'access_token', 'refresh_token'];

  const clone = {...object};
  for (sensitiveProperty of sensitiveProperties) {
    if (clone[sensitiveProperty]) {
      clone[sensitiveProperty] = '****';
    }
  }

  return clone;
}

module.exports = {maskObject};
