// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const FactorService = require('../factors/factorService');


/**
 * A class for making TOTP related requests to OIDC.
 * @extends FactorService
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class TOTPService extends FactorService {
  /**
   * Attempt to complete a TOTP multi-factor verification.
   * @param {string} enrollmentId The identifier of the TOTP enrollment.
   * @param {string} otp The OTP to attempt verification with.
   * @return {Promise<string>} The HTTP response body of the request.
   */
  async verify(enrollmentId, otp) {
    const response = await this.post(
        `/v2.0/factors/totp/${enrollmentId}`, {otp}, {returnJwt: true});
    return response.data;
  }
}

module.exports = TOTPService;
