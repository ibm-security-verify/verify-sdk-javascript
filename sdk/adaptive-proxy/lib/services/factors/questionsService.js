// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const FactorService = require('../factors/factorService');


/**
 * A class for making knowledge questions related requests to OIDC.
 * @extends FactorService
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class QuestionsService extends FactorService {
  /**
   * Request a knowledge questions multi-factor verification for this
   * enrollment.
   * @param {string} enrollmentId The identifier of the knowledge questions
   * enrollment.
   * @return {Promise<Object>} The knowledge questions verification.
   */
  async generate(enrollmentId) {
    const response = await this.post(
        `/v2.0/factors/questions/${enrollmentId}/verifications`);
    return response.data;
  }

  /**
   * Attempt to complete a knowledge questions multi-factor verification.
   * @param {string} verificationId The identifier of the knowledge questions
   * verification received in {@link QuestionsService#generate}.
   * @param {string} enrollmentId The identifier of the knowledge questions
   * enrollment.
   * @param {Object[]} questions The array of question keys and corresponding
   * answers to attempt verification with.
   * @return {Promise<string>} The HTTP response body of the request.
   */
  async verify(verificationId, enrollmentId, questions) {
    const response = await this.post(`/v2.0/factors/questions/` +
        `${enrollmentId}/verifications/${verificationId}`, {questions},
    {returnJwt: true});
    return response.data;
  }
}

module.exports = QuestionsService;
