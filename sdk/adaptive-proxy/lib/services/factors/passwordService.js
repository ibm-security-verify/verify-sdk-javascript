// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const FactorService = require('../factors/factorService');


/**
 * A class for making password related requests to OIDC.
 * @extends FactorService
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class PasswordService extends FactorService {
  /**
   * Lookup identity sources by sourceName (or all password-capable
   * sources if sourceName not defined)
   * @param {string} sourceName The name of the Identity Source.
   * @return {Promise<Object>} The array of sources returned.
   */
  async lookupIdentitySources(sourceName) {
    let response;
    if (sourceName) {
      response = await this.get(
          `/v1.0/authnmethods/password?search=name = "${sourceName}"`);
    } else {
      response = await this.get('/v1.0/authnmethods/password');
    }
    return response.data.password;
  }

  /**
   * Attempt password authentication with an identity source.
   * @param {string} identitySourceId The identifier of an identity source
   * resolved in {@link PasswordService#resolveIdentitySource}.
   * @param {string} username The username to authenticate as.
   * @param {string} password The password to authenticate with.
   * @return {Promise<Object>} The HTTP response body of the authentication.
   * This response body also includes the JWT to be validated by OIDC in
   * {@link PolicyService#validate}.
   */
  async authenticate(identitySourceId, username, password) {
    const response = await this.post(
        `/v1.0/authnmethods/password/${identitySourceId}`,
        {username, password}, {returnJwt: true});
    return response.data;
  }
}

module.exports = PasswordService;
