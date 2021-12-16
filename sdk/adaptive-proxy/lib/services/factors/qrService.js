// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const FactorService = require('../factors/factorService');


/**
 * A class for making QR login related requests to OIDC.
 * @extends FactorService
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class QRService extends FactorService {
  /**
   * Initiate a QR login verification.
   * @param {string} profileId The identifier of an IBM Verify registration
   * profile.
   * @return {Promise<Object>} The QR code login verification.
   */
  async generate(profileId) {
    const response = await this.get('/v2.0/factors/qr/authenticate',
        {profileId});
    return response.data;
  }

  /**
   * Complete a QR login verification.
   * @param {string} verificationId The identifier of the QR login verification
   * received in {@link QRService#generate}.
   * @param {string} dsi The DSI of the QR login verification received in
   * {@link QRService#generate}.
   * @return {Promise<string>} The HTTP response body of the request.
   */
  async verify(verificationId, dsi) {
    const response = await this.get(
        `/v2.0/factors/qr/authenticate/${verificationId}`,
        {dsi: dsi, returnJwt: true});
    return response.data;
  }
}

module.exports = QRService;
