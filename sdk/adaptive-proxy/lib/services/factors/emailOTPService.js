// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project

const FactorService = require('../factors/factorService');


/**
 * A class for making email OTP related requests to OIDC.
 * @extends FactorService
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class EmailOTPService extends FactorService {
  /**
   * Request an email OTP multi-factor verification for this enrollment.
   * @param {string} enrollmentId The identifier of the email OTP enrollment.
   * @return {Promise<Object>} The email OTP verification.
   */
  async generate(enrollmentId) {
    const response = await this.post(
        `/v2.0/factors/emailotp/${enrollmentId}/verifications`);
    return response.data;
  }

  /**
   * Attempt to complete an email OTP multi-factor verification.
   * @param {string} verificationId The identifier of the email OTP verification
   * received in {@link EmailOTPService#generate}.
   * @param {string} enrollmentId The identifier of the email OTP enrollment.
   * @param {string} otp The OTP to attempt verification with.
   * @return {Promise<string>} The HTTP response body of the request.
   */
  async verify(verificationId, enrollmentId, otp) {
    const response = await this.post(`/v2.0/factors/emailotp/` +
      `${enrollmentId}/verifications/${verificationId}`, {otp},
    {returnJwt: true});
    return response.data;
  }
}

module.exports = EmailOTPService;
