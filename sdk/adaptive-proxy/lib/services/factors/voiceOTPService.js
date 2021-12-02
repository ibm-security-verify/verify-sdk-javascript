// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const FactorService = require('../factors/factorService');


/**
 * A class for making Voice OTP related requests to OIDC.
 * @extends FactorService
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class VoiceOTPService extends FactorService {
  /**
   * Request an Voice OTP multi-factor verification for this enrollment.
   * @param {string} enrollmentId The identifier of the Voice OTP enrollment.
   * @return {Promise<Object>} The Voice OTP verification.
   */
  async generate(enrollmentId) {
    const response = await this.post(
        `/v2.0/factors/voiceotp/${enrollmentId}/verifications`);
    return response.data;
  }

  /**
   * Attempt to complete an Voice OTP multi-factor verification.
   * @param {string} verificationId The identifier of the Voice OTP verification
   * received in {@link VoiceOTPService#generate}.
   * @param {string} enrollmentId The identifier of the Voice OTP enrollment.
   * @param {string} otp The OTP to attempt verification with.
   * @return {Promise<string>} The HTTP response body of the request.
   */
  async verify(verificationId, enrollmentId, otp) {
    const response = await this.post(`/v2.0/factors/voiceotp/` +
      `${enrollmentId}/verifications/${verificationId}`, {otp},
    {returnJwt: true});
    return response.data;
  }
}

module.exports = VoiceOTPService;
