// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

/**
 * Checks if the object has a key with value of type 'string'
 * that is not empty
 * @param {Object} obj The object
 * @param {string} key The property name
 * @return {boolean} true if the value is found
 */
function has(obj, key) {
  return obj.hasOwnProperty(key) && typeof obj[key] == 'string' &&
      obj[key].length;
}

/**
 * Gets a value and, if not found, returns the defaultValue
 * @param {Object} obj The object
 * @param {string} key The property name
 * @param {string} defaultValue  The default value
 * @return {string} Property value or default
 */
function getOrDefault(obj, key, defaultValue) {
  return (obj != null && has(obj, key)) ? obj[key] : defaultValue;
}

module.exports = {has, getOrDefault};
