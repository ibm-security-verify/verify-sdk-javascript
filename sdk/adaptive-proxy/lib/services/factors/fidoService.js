// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const FactorService = require('../factors/factorService');


/**
 * A class for making FIDO related requests to OIDC. These include initiating
 * and completing a FIDO verification.
 * @extends FactorService
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class FIDOService extends FactorService {
  /**
   * Initiate a FIDO verification.
   * @param {string} relyingPartyId The identifier of a relying party resolved
   * in {@link FIDOService#resolveRelyingParty}.
   * @param {string} userId The identifier of the OIDC user for which to
   * initiate FIDO verification.
   * @return {Promise<Object>} The assertion options, containing FIDO
   * credentials.
   */
  async generate(relyingPartyId, userId) {
    const response = await this.post(`/v2.0/factors/fido2/relyingparties/` +
        `${relyingPartyId}/assertion/options`, {userVerification: 'preferred',
      userId});
    return response.data;
  }

  /**
   * Complete a FIDO verification.
   * @param {string} relyingPartyId The identifier of a relying party resolved
   * in {@link FIDOService#resolveRelyingParty}.
   * @param {string} credentialId The identifier of a FIDO credential received
   * in the assertion options in {@link FIDOService#generate}.
   * @param {string} clientDataJSON The assertion options received in
   * {@link FIDOService#generate}, in Base64 URL encoded format.
   * @param {string} authenticatorData The information about the authenticator
   * used for the FIDO verification, verified by the signature.
   * @param {string} [userHandle] The identifier of the user who owns the
   * authenticator used for the FIDO verification.
   * @param {string} signature The challenge received in
   * {@link FIDOService#generate}, signed by the authenticator used
   * for the FIDO verification, in Base64 URL encoded format.
   * @return {Promise<string>} The JWT to be validated by OIDC in
   * {@link PolicyService#validate}.
   */
  async evaluate(relyingPartyId, credentialId, clientDataJSON,
      authenticatorData, userHandle, signature) {
    const response = await this.post(
        `/v2.0/factors/fido2/relyingparties/${relyingPartyId}/assertion/result`,
        {
          type: 'public-key',
          rawId: credentialId,
          response: {
            clientDataJSON,
            authenticatorData,
            userHandle,
            signature,
          },
          id: credentialId,
          getClientExtensionResults: {},
        }, {returnJwt: true});
    return response.data;
  }
}

module.exports = FIDOService;
