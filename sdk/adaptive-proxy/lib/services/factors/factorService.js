// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project

const Service = require('../service');


/**
 * A class for making Factors requests.
 * @extends Service
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class FactorService extends Service {
  /**
   * Get an email OTP factor enrollment.
   * @param {string} userId The identifier of the user for which to retrieve
   * enrollments.
   * @return {Promise<Array>} The array of enrollments for the given user.
   */
  async getEnrollments(userId=undefined) {
    let response;
    if (userId) {
      response = await this.get('/v2.0/factors',
          {search: `userId="${userId}"&enabled=true`});
    } else {
      response = await this.get('/v2.0/factors',
          {search: `enabled=true`});
    }
    return response.data;
  }
}

module.exports = FactorService;
