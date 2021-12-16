// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const FactorService = require('../factors/factorService');


/**
 * A class for making SMS OTP related requests to OIDC.
 * @extends FactorService
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class SMSOTPService extends FactorService {
  /**
   * Request an SMS OTP multi-factor verification for this enrollment.
   * @param {string} enrollmentId The identifier of the SMS OTP enrollment.
   * @return {Promise<Object>} The SMS OTP verification.
   */
  async generate(enrollmentId) {
    const response = await this.post(
        `/v2.0/factors/smsotp/${enrollmentId}/verifications`);
    return response.data;
  }

  /**
   * Attempt to complete an SMS OTP multi-factor verification.
   * @param {string} verificationId The identifier of the SMS OTP verification
   * received in {@link SMSOTPService#generate}.
   * @param {string} enrollmentId The identifier of the SMS OTP enrollment.
   * @param {string} otp The OTP to attempt verification with.
   * @return {Promise<string>} The HTTP response body of the request.
   */
  async verify(verificationId, enrollmentId, otp) {
    const response = await this.post(`/v2.0/factors/smsotp/` +
      `${enrollmentId}/verifications/${verificationId}`, {otp},
    {returnJwt: true});
    return response.data;
  }
}

module.exports = SMSOTPService;
