// Copyright contributors to the IBM Security Verify Adaptive Proxy SDK
// for JavaScript project


const LRU = require('lru-cache');

const transactionUtils = require('./utils/transactionUtils');
const ConfigurationError = require('./errors/configurationError');
const TransactionError = require('./errors/transactionError');
const TokenError = require('./errors/tokenError');
const PolicyService = require('./services/oidc/policyService');
const FIDOService = require('./services/factors/fidoService');
const PasswordService = require(
    './services/factors/passwordService');
const QRService = require('./services/factors/qrService');
const TOTPService = require('./services/factors/totpService');
const EmailOTPService = require('./services/factors/emailOTPService');
const SMSOTPService = require('./services/factors/smsOTPService');
const VoiceOTPService = require('./services/factors/voiceOTPService');
const QuestionsService = require('./services/factors/questionsService');
const PushService = require('./services/factors/pushService');
const FactorService = require('./services/factors/factorService');
const TokenService = require('./services/oidc/tokenService');


/**
 * Class representing the PDA (Policy Driven Authentication) SDK. Used to
 * perform and validate first- and second-factor verifications on CI (Cloud
 * Identity).
 * @author Adam Dorogi-Kaposi <adam.dorogi-kaposi@ibm.com>
 */
class Adaptive {
  /**
   * Create a new {@link Adaptive} object.
   * @param {Object} config The configuration settings used for CI requests.
   * @param {string} config.clientId The identifier of the client application.
   * @param {string} config.clientSecret The client application secret.
   * @param {string} config.tenantUrl The URL of the tenant.
   * @param {Object} [transactionFunctions] An object containing transaction
   * operation functions. This parameter is optional, in case the
   * developer would like to handle the storing, retrieving, updating, and
   * deleting of transactions created during the A2 flow in an external
   * database. Otherwise, a default in-memory option is used for handling
   * transactions. If specified, this object must contain four parameters:
   * <code>createTransaction</code>, <code>getTransaction</code>,
   * <code>updateTransaction</code>, and <code>deleteTransaction</code>, each
   * being the appropriate function to store, retrieve, update, and delete
   * transactions respectively. The custom storage mechanism should ideally have
   * a time-to-live for the transactions (e.g. 1 hour), to prevent accumulating
   * unused/unfinished transactions.
   * @param {Function} [transactionFunctions.createTransaction] The function
   * used to create (store) a transaction. This function should take one
   * parameter; a transaction <code>Object</code>. It should store the object in
   * a database of choice, indexed by a randomly generated v4 UUID (the
   * transaction ID). After storing the transaction object associated to a
   * transaction ID, the function should return the transaction ID as a
   * <code>string</code>.
   * @param {Function} [transactionFunctions.getTransaction] The function used
   * to retrieve stored transactions. This function should take one parameter;
   * a transaction ID <code>string</code>. It should return the transaction
   * <code>Object</code> associated to the given transaction ID.
   * @param {Function} [transactionFunctions.updateTransaction] The function
   * used to update (i.e. add additional properties to) an existing transaction.
   * This function should take two parameters (in order); a transaction ID
   * <code>string</code> of the transaction to update, and an
   * <code>Object</code> of additional properties to add to the
   * transaction. For example, if the existing transaction is <code>{"userId":
   * "123456"}</code>, and the object passed into this function is
   * <code>{"name": "John"}</code>, the updated transaction should be
   * <code>{"userId": "123456", "name": "John"}</code>. This function shouldn't
   * return anything.
   * @param {Function} [transactionFunctions.deleteTransaction] The function
   * used to delete an existing transaction. This function should take one
   * parameter; a transaction ID <code>string</code>. The function should remove
   * the transaction associated with the given transaction ID from the database
   * storage. This function shouldn't return anything.
   * @throws {ConfigurationError} The configuration object doesn't contain the
   * required properties.
   * @throws {TransactionError} The <code>createTransaction</code>,
   * <code>getTransaction</code>, <code>updateTransaction</code>, or
   * <code>deleteTransaction</code> functions are missing from the transaction
   * functions object.
   */
  constructor(config, transactionFunctions={
    createTransaction: transactionUtils.createTransaction,
    getTransaction: transactionUtils.getTransaction,
    updateTransaction: transactionUtils.updateTransaction,
    deleteTransaction: transactionUtils.deleteTransaction}) {
    if (!config.clientId) {
      throw new ConfigurationError(
          `Cannot find property 'clientId' in configuration settings.`);
    } else if (!config.clientSecret) {
      throw new ConfigurationError(
          `Cannot find property 'clientSecret' in configuration settings.`);
    } else if (!config.tenantUrl) {
      throw new ConfigurationError(
          `Cannot find property 'tenantUrl' in configuration settings.`);
    }

    if (!transactionFunctions.createTransaction) {
      throw new TransactionError(
          `Cannot find function 'createTransaction' in transaction functions.`);
    } else if (!transactionFunctions.getTransaction) {
      throw new TransactionError(
          `Cannot find function 'getTransaction' in transaction functions.`);
    } else if (!transactionFunctions.updateTransaction) {
      throw new TransactionError(
          `Cannot find function 'updateTransaction' in transaction functions.`);
    } else if (!transactionFunctions.deleteTransaction) {
      throw new TransactionError(
          `Cannot find function 'deleteTransaction' in transaction functions.`);
    }

    this._config = config;
    this._transactionFunctions = transactionFunctions;

    console.log(`[${Adaptive.name}:constructor(config, transactionFunctions)]`,
        'clientId:', this._config.clientId);
    console.log(`[${Adaptive.name}:constructor(config, transactionFunctions)]`,
        'clientSecret:', '****');
    console.log(`[${Adaptive.name}:constructor(config, transactionFunctions)]`,
        'tenantUrl:', this._config.tenantUrl);

    console.log(`[${Adaptive.name}:constructor(config, transactionFunctions)]`,
        'createTransaction:', this._transactionFunctions.createTransaction);
    console.log(`[${Adaptive.name}:constructor(config, transactionFunctions)]`,
        'getTransaction:', this._transactionFunctions.getTransaction);
    console.log(`[${Adaptive.name}:constructor(config, transactionFunctions)]`,
        'updateTransaction:', this._transactionFunctions.updateTransaction);
    console.log(`[${Adaptive.name}:constructor(config, transactionFunctions)]`,
        'deleteTransaction:', this._transactionFunctions.deleteTransaction);
  }

  /**
   * Perform an initial grant request.
   *
   * The initial grant request uses the <code>policyauth</code> grant-type to
   * evaluate the policy attached to the client application on OIDC with the
   * risk engine.
   *
   * An in-memory transaction is also created to associate subsequent requests
   * to a session or "transaction".
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @return {Promise<Object>} The policy evaluation result object. The result
   * object has a <code>status</code> property of either <code>deny</code>, or
   * <code>requires</code>. If <code>deny</code>, only the <code>status</code>
   * property is included in the result object. If <code>requires</code>, a
   * transaction is created, and the <code>transactionId</code> and an array of
   * <code>allowedFactors</code> is also included in the result object,
   * indicating that further first-factor authentication is required.
   * @example <caption><code>deny</code> result object</caption>
   * {
   *   status: 'deny'
   * }
   * @example <caption><code>requires</code> result object</caption>
   * {
   *   status: 'requires',
   *   transactionId: '36a101c7-7426-4f45-ab3c-55f8dc075c6e',
   *   allowedFactors: ['qr', 'fido', 'password']
   * }
   */
  async assessPolicy({sessionId, userAgent, ipAddress,
    evaluationContext='login'}) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const policyService = new PolicyService({clientId: this._config.clientId,
      clientSecret: this._config.clientSecret}, this._config.tenantUrl,
    context);

    try {
      // Get a `policyauth` access token from OIDC.
      const assessment = await policyService.assess();
      console.log(`[${Adaptive.name}:assessPolicy(context)]`, 'assessment:',
          assessment);

      if (assessment.scope === 'openid') {
        return {status: 'allow', token: assessment};
      }

      // If no error is thrown by this point, further authentication is required
      // (i.e. we received a `requires` response).

      // Create transaction and store in memory cache.
      const transaction = {assessment};
      const transactionId = this._transactionFunctions
          .createTransaction(transaction);

      const allowedFactors = assessment.allowedFactors.map((factor) => {
        return {type: factor};
      });
      return {status: 'requires', allowedFactors, transactionId};
    } catch (error) {
      // Policy evaluation is denied.
      console.log(`[${Adaptive.name}:assessPolicy(context)]`, 'error:', error);
      const jsonResp = {status: 'deny'};
      if (error.response.data) {
        jsonResp.detail = error.response.data;
      }
      return jsonResp;
    }
  }

  /**
   * Initiate a FIDO first-factor verification to be completed by the
   * user-agent.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} relyingPartyId The identifier of relying party associated
   * with the FIDO registration.
   * @param {string} userId The identifier of the OIDC user for which to
   * initiate a FIDO verification.
   * @return {Promise<Object>} A FIDO challenge to be completed by the
   * user-agent.
   * @example <caption>FIDO challenge return value</caption>
   * {
   *   "transactionId": "36a101c7-7426-4f45-ab3c-55f8dc075c6e",
   *   "fido": {
   *     "rpId": "fido.verify.ibm.com",
   *     "challenge": "Q29uZ3JhdHVsYXRpb25zIFlvdSBmb3VuZCBpdAo",
   *     "userVerification": "preferred",
   *     "timeout": 30000,
   *     "allowCredentials": [
   *       {
   *         "type": "public-key",
   *         "id": "SSBhbSBhIGNyZWRlbnRpYWwK"
   *       }
   *     ]
   *   }
   * }
   */
  async generateFIDO({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, relyingPartyId, userId) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const fidoService = new FIDOService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await fidoService.generate(relyingPartyId, userId);
    console.log(`[${Adaptive.name}:generateFIDO(context, transactionId, ` +
        `relyingPartyId, userId)]`, 'verification:', verification);

    // Update transaction in memory cache.
    this._transactionFunctions
        .updateTransaction(transactionId, {fido: verification});
    this._transactionFunctions
        .updateTransaction(transactionId, {userId});

    return {transactionId, fido: verification};
  }

  /**
   * Complete a FIDO first-factor verification and validate the resulting JWT.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} relyingPartyId The identifier of relying party associated
   * with the FIDO registration.
   * @param {string} authenticatorData The information about the authentication
   * that was produced by the user-agent authenticator and verified by the
   * signature.
   * @param {string} userHandle The identifier for the user who owns this
   * authenticator.
   * @param {string} signature The signature of the challenge data that was
   * produced by the user-agent authenticator.
   * @param {string} clientDataJSON The base64 encoded client data JSON object.
   * @param {string} credentialId The Id of the credential (from authenticator).
   * @return {Promise<Object>} The JWT validation result object. The result
   * object has a <code>status</code> property of either <code>allow</code>,
   * <code>deny</code>, or <code>requires</code>.
   * If <code>allow</code>, a <code>token</code> object is also included in the
   * result object.
   * If <code>deny</code>, a <code>details</code> object is returned if an
   * error message was returned from the token endpoint.
   * If <code>requires</code>, the allowed second-factor enrollments are
   * retrieved and included in the result object, indicating that further
   * second-factor authentication is required.
   * @example <caption><code>allow</code> result object</caption>
   * {
   *   status: 'allow',
   *   token: {
   *     access_token: 'zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC',
   *     refresh_token: 'wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz',
   *     scope: 'openid',
   *     grant_id: 'a0b440b6-fefb-46ea-a603-e1040534cd28',
   *     id_token: 'eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA',
   *     token_type: 'Bearer',
   *     expires_in: 7120
   *   }
   * }
   * @example <caption><code>deny</code> result object</caption>
   * {
   *   status: 'deny',
   *   detail: {
   *     error: 'adaptive_more_info_required',
   *     error_description: 'CSIAQ0298E Adaptive access...'
   *   }
   * }
   * @example <caption><code>requires</code> result object</caption>
   * {
   *   status: 'requires',
   *   transactionId: '36a101c7-7426-4f45-ab3c-55f8dc075c6e',
   *   enrolledFactors: [
   *     {
   *       id: '61e39f0a-836b-48fa-b4c9-cface6a3ef5a',
   *       userId: '60300035KP',
   *       type: 'emailotp',
   *       created: '2020-06-15T02:51:49.131Z',
   *       updated: '2020-06-15T03:15:18.896Z',
   *       attempted: '2020-07-16T04:30:14.066Z',
   *       enabled: true,
   *       validated: true,
   *       attributes: {
   *         emailAddress: 'email@email.com'
   *       }
   *     }
   *   ]
   * }
   */
  async evaluateFIDO({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, relyingPartyId,
  authenticatorData, userHandle, signature, clientDataJSON, credentialId) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);
    if (!transaction.fido) {
      throw new TransactionError(
          'This transaction has not initiated a FIDO verification.');
    }

    if (credentialId === undefined) {
      credentialId = transaction.fido.allowCredentials[0].id;
    }

    console.log(`[${Adaptive.name}:evaluateFIDO(context, transactionId, ` +
        `relyingPartyId, authenticatorData, userHandle, signature, ` +
        `clientDataJSON)]`, 'credentialId:', credentialId);

    const fidoService = new FIDOService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    // Complete FIDO verification.
    const verification = await fidoService.evaluate(relyingPartyId,
        credentialId, clientDataJSON, authenticatorData, userHandle,
        signature);
    console.log(`[${Adaptive.name}:evaluateFIDO(context, transactionId, ` +
        `relyingPartyId, authenticatorData, userHandle, signature, ` +
        `clientDataJSON)]`, 'verification:', verification);

    return this._validateAssertion(transactionId, context,
        verification.assertion, verification.userId);
  }

  /**
   * Lookup Identity Sources by name.  If name not defined then
   * return all password-capable sources.
   *
   * Complete a FIDO first-factor verification and validate the resulting JWT.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} [sourceName] The source name to look up.
   * @return {Promise<Object>} The result object. The result
   * object contains an array of identity sources for this user.
   * @example <caption>Result object</caption>
   * [
   *   {
   *     "name": "Cloud Directory",
   *     "location": "https://<tenant_url>/v1.0/authnmethods/password/11111111-2222-3333-4444-555555555555",
   *     "id": "11111111-2222-3333-4444-555555555555",
   *     "type": "ibmldap"
   *   }
   * ]
   */
  async lookupIdentitySources({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, sourceName) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const passwordService = new PasswordService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const sources = await passwordService.lookupIdentitySources(sourceName);

    console.log(`[${Adaptive.name}:lookupIdentitySources(context, ` +
        `transactionId, sourceName)]`, 'sources:', sources);

    return sources;
  }

  /**
   * Complete a password first-factor verification.
   *
   * Complete a password first-factor verification, validate the resulting JWT,
   * and gather second-factor enrollments if needed.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} identitySourceId The identifier of the identity source
   * associated with the password registration.
   * @param {string} username The username to authenticate as.
   * @param {string} password The password to authenticate with.
   * @return {Promise<Object>} The JWT evaluation result object. The result
   * object has a <code>status</code> property of either <code>allow</code>,
   * <code>deny</code>, or <code>requires</code>.
   * If <code>allow</code>, a <code>token</code> object is also included in the
   * result object.
   * If <code>deny</code>, a <code>details</code> object is returned if an
   * error message was returned from the token endpoint.
   * If <code>requires</code>, the allowed second-factor enrollments are
   * retrieved and included in the result object, indicating that further
   * second-factor authentication is required.
   * @example <caption><code>allow</code> result object</caption>
   * {
   *   status: 'allow',
   *   token: {
   *     access_token: 'zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC',
   *     refresh_token: 'wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz',
   *     scope: 'openid',
   *     grant_id: 'a0b440b6-fefb-46ea-a603-e1040534cd28',
   *     id_token: 'eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA',
   *     token_type: 'Bearer',
   *     expires_in: 7120
   *   }
   * }
   * @example <caption><code>deny</code> result object</caption>
   * {
   *   status: 'deny',
   *   detail: {
   *     error: 'adaptive_more_info_required',
   *     error_description: 'CSIAQ0298E Adaptive access...'
   *   }
   * }
   * @example <caption><code>requires</code> result object</caption>
   * {
   *   status: 'requires',
   *   transactionId: '36a101c7-7426-4f45-ab3c-55f8dc075c6e',
   *   enrolledFactors: [
   *     {
   *       id: '61e39f0a-836b-48fa-b4c9-cface6a3ef5a',
   *       userId: '60300035KP',
   *       type: 'emailotp',
   *       created: '2020-06-15T02:51:49.131Z',
   *       updated: '2020-06-15T03:15:18.896Z',
   *       attempted: '2020-07-16T04:30:14.066Z',
   *       enabled: true,
   *       validated: true,
   *       attributes: {
   *         emailAddress: 'email@email.com'
   *       }
   *     }
   *   ]
   * }
   */
  async evaluatePassword({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, identitySourceId, username,
  password) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const passwordService = new PasswordService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const authentication = await passwordService.authenticate(identitySourceId,
        username, password);

    console.log(`[${Adaptive.name}:evaluatePassword(context, transactionId, ` +
        `identitySourceId, username, password)]`, 'authentication:',
    authentication);

    // Store user ID in transaction
    this._transactionFunctions
        .updateTransaction(transactionId, {userId: authentication.id});

    return this._validateAssertion(transactionId, context,
        authentication.assertion, authentication.id);
  }

  /**
   * @private
   * Validate a JWT assertion received after a first- or second-factor
   * authentication. If a <code>requires</code> status is received, get the
   * allowed enrollment options for the user.
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} assertion The JWT assertion to validate.
   * @param {string} userId The user ID for which to retrieve enrollments on a
   * <code>requires</code> response.
   */
  async _validateAssertion(transactionId, context, assertion, userId) {
    const policyService = new PolicyService({clientId: this._config.clientId,
      clientSecret: this._config.clientSecret},
    this._config.tenantUrl,
    context);

    try {
      const assessment = await policyService.validate(assertion);
      console.log(`[${Adaptive.name}:_validateAssertion(transactionId, ` +
          `context, assertion, userId)]`, 'assessment:', assessment);

      if (assessment.scope === 'openid') {
        // No 2FA required, return token.
        this._transactionFunctions.deleteTransaction(transactionId);
        return {status: 'allow', token: assessment};
      }

      // Further 2FA is required.

      // Update the assessment in the transaction.
      this._transactionFunctions.updateTransaction(transactionId, {assessment});

      const factorService = new FactorService(
          {accessToken: assessment.access_token},
          this._config.tenantUrl, context);

      // Get Factors enrollments for the current user.
      const enrollments = await factorService.getEnrollments(userId);
      console.log(`[${Adaptive.name}:_validateAssertion(transactionId, ` +
            `context, assertion, userId)]`, 'enrollments:', enrollments);

      // Filter the user's enrollment options based on the assessment's
      // `allowedFactors`, if available.
      let enrolledFactors = enrollments.factors; // Filter the user's enrollment options based on the assessment's `allowedFactors.factors`;
      if (assessment.allowedFactors) {
        enrolledFactors = enrolledFactors.filter((enrollment) => {
          const normalizedType = enrollment.subType
            ? `${enrollment.type}s_${enrollment.subType}`
            : enrollment.type;

          console.log(`[${Adaptive.name}:_validateAssertion(transactionId, context, assertion, userId)]`,
            'Checking normalizedType:', normalizedType);
          // You may want to update the filtering logic here as needed.
          return assessment.allowedFactors.includes(normalizedType);
        });
      }

      console.log(`[${Adaptive.name}:_validateAssertion(transactionId, ` +
      `context, assertion, userId)]`, 'enrolledFactors:', enrolledFactors);

      return {status: 'requires', enrolledFactors, transactionId};
    } catch (error) {
      // Deny assessment.
      console.log(`[${Adaptive.name}:_validateAssertion(transactionId, ` +
          `context, assertion, userId)]`, 'error:', error);
      const jsonResp = {status: 'deny'};
      if (error.response.data) {
        jsonResp.detail = error.response.data;
      }
      return jsonResp;
    }
  }

  /**
   * Initiate a QR login first-factor verification.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} profileId The identifier of an IBM Verify registration
   * profile. Can be retrieved from <code>/v1.0/authenticators/clients</code>.
   * @return {Promise<Object>} The QR code login verification.
   * @example <caption>QR code return value</caption>
   * {
   *   transactionId: '36a101c7-7426-4f45-ab3c-55f8dc075c6e',
   *   qr: {
   *     code: 'iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABR...'
   *   }
   * }
   */
  async generateQR({sessionId, userAgent, ipAddress, evaluationContext='login'},
      transactionId, profileId) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const qrService = new QRService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    // Initiate a QR login.
    const verification = await qrService.generate(profileId);
    console.log(`[${Adaptive.name}:generateQR(context, transactionId, ` +
        `profileId)]`, 'verification:', verification);

    // Update transaction in memory cache.
    this._transactionFunctions
        .updateTransaction(transactionId, {qr: verification});

    return {transactionId, qr: {code: verification.qrCode}};
  }

  /**
   * Evaluate a QR login first-factor verification.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @return {Promise<Object>} Either QR transaction state result object
   * (if not complete) or the JWT evaluation result object.
   * If QR transaction not complete, the result object has <code>status</code>
   * property of <code>pending</code>, <code>timeout</code>,
   * or <code>error</code>.
   * If QR transaction is complete, the result object has a <code>status</code>
   * property of either <code>allow</code>, <code>deny</code>,
   * or <code>requires</code>.
   * If <code>allow</code>, a <code>token</code> object is also included in the
   * result object.
   * If <code>deny</code>, a <code>details</code> object is returned if an
   * error message was returned from the token endpoint.
   * If <code>requires</code>, the allowed second-factor enrollments are
   * retrieved and included in the result object, indicating that further
   * second-factor authentication is required.
   * @example <caption><code>pending</code> result object</caption>
   * {
   *   status: 'pending',
   *   expiry: '2021-04-26T12:06:06.501Z'
   * }
   * @example <caption><code>pending</code> result object</caption>
   * {
   *   status: 'timeout',
   *   expiry: '2021-04-26T12:06:06.501Z'
   * }
   * @example <caption><code>error</code> result object</caption>
   * {
   *   status: 'error'
   * }
   * @example <caption><code>allow</code> result object</caption>
   * {
   *   status: 'allow',
   *   token: {
   *     access_token: 'zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC',
   *     refresh_token: 'wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz',
   *     scope: 'openid',
   *     grant_id: 'a0b440b6-fefb-46ea-a603-e1040534cd28',
   *     id_token: 'eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA',
   *     token_type: 'Bearer',
   *     expires_in: 7120
   *   }
   * }
   * @example <caption><code>deny</code> result object</caption>
   * {
   *   status: 'deny',
   *   detail: {
   *     error: 'adaptive_more_info_required',
   *     error_description: 'CSIAQ0298E Adaptive access...'
   *   }
   * }
   * @example <caption><code>requires</code> result object</caption>
   * {
   *   status: 'requires',
   *   transactionId: '36a101c7-7426-4f45-ab3c-55f8dc075c6e',
   *   enrolledFactors: [
   *     {
   *       id: '61e39f0a-836b-48fa-b4c9-cface6a3ef5a',
   *       userId: '60300035KP',
   *       type: 'emailotp',
   *       created: '2020-06-15T02:51:49.131Z',
   *       updated: '2020-06-15T03:15:18.896Z',
   *       attempted: '2020-07-16T04:30:14.066Z',
   *       enabled: true,
   *       validated: true,
   *       attributes: {
   *         emailAddress: 'email@email.com'
   *       }
   *     }
   *   ]
   * }
   */
  async evaluateQR({sessionId, userAgent, ipAddress, evaluationContext='login'},
      transactionId) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);
    if (!transaction.qr) {
      throw new TransactionError(
          'This transaction has not initiated a QR login verification.');
    }
    const qrService =
             new QRService({accessToken: transaction.assessment.access_token},
                 this._config.tenantUrl,
                 context);

    const verification = await qrService.verify(transaction.qr.id,
        transaction.qr.dsi);
    console.log(`[${Adaptive.name}:evaluateQR(context, transactionId)]`,
        'verification:', verification);

    if (verification.state === 'SUCCESS') {
      return this._validateAssertion(transactionId, context,
          verification.assertion, verification.userId);
    }

    if (verification.state) {
      return {
        status: verification.state.toLowerCase(),
        expiry: verification.expiry,
      };
    } else {
      return {status: 'error'};
    }
  }

  /**
   * Get Access Token for a transaction.
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @return {string} The Access Token associated with the transaction.
   */
  getToken(transactionId) {
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    return transaction.assessment.access_token;
  }

  /**
   * Complete a TOTP second-factor verification and validate the resulting JWT.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} enrollmentId The identifier of the enrollment to perform
   * second-factor verification with.
   * @param {string} otp The OTP to attempt verification with.
   * @return {Promise<Object>} The access and refresh tokens which should have
   * been received from the JWT validation, along with the <code>status</code>
   * property of <code>allow</code>.
   */
  async evaluateTOTP({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, enrollmentId, otp) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const totpService = new TOTPService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await totpService.verify(enrollmentId, otp);
    console.log(`[${Adaptive.name}:evaluateTOTP(context, transactionId, ` +
        `enrollmentId, otp)]`, 'verification:', verification);

    return this._validateAssertion(transactionId, context,
        verification.assertion, verification.userId);
  }

  /**
   * Request an email OTP.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * @param {string} enrollmentId The identifier of the enrollment to perform
   * second-factor verification with.
   * @return {Promise<Object>} The a four-digit correlation associated with the
   * verification. It will be prefixed to the one-time password in the Email to
   * be sent.
   */
  async generateEmailOTP({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, enrollmentId) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const emailOTPService = new EmailOTPService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await emailOTPService.generate(enrollmentId);
    console.log(`[${Adaptive.name}:generateEmailOTP(context, transactionId, ` +
        `enrollmentId)]`, 'verification:', verification);

    // Update transaction in memory cache.
    this._transactionFunctions.updateTransaction(transactionId,
        {emailotp: {enrollmentId, verification}});

    return {correlation: verification.correlation};
  }

  /**
   * Complete an email OTP second-factor verification and validate the resulting
   * JWT.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} otp The email OTP received in the email after the email OTP
   * request in {@link Adaptive#generateEmailOTP}. This OTP shouldn't include
   * the correlation prefix (the four digits before the dash).
   * @return {Promise<Object>} The access and refresh tokens which should have
   * been received from the JWT validation, along with the <code>status</code>
   * property of <code>allow</code>.
   */
  async evaluateEmailOTP({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, otp) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);
    if (!transaction.emailotp) {
      throw new TransactionError(
          'This transaction has not initiated an email OTP verification.');
    }

    const emailOTPService = new EmailOTPService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await emailOTPService.verify(
        transaction.emailotp.verification.id, transaction.emailotp.enrollmentId,
        otp);
    console.log(`[${Adaptive.name}:evaluateEmailOTP(context, transactionId, ` +
        `otp)]`, 'verification:', verification);

    return this._validateAssertion(transactionId, context,
        verification.assertion, verification.userId);
  }

  /**
   * Request an SMS OTP.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * @param {string} enrollmentId The identifier of the enrollment to perform
   * second-factor verification with.
   * @return {Promise<Object>} The a four-digit correlation associated with the
   * verification. It will be prefixed to the one-time password in the SMS to be
   * sent.
   */
  async generateSMSOTP({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, enrollmentId) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const smsOTPService = new SMSOTPService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await smsOTPService.generate(enrollmentId);
    console.log(`[${Adaptive.name}:generateSMSOTP(context, transactionId, ` +
        `enrollmentId)]`, 'verification:', verification);

    // Update transaction in memory cache.
    this._transactionFunctions.updateTransaction(transactionId,
        {smsotp: {enrollmentId, verification}});

    return {correlation: verification.correlation};
  }

  /**
   * Complete an SMS OTP second-factor verification and validate the resulting
   * JWT.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} otp The SMS OTP received on the phone after the SMS OTP
   * request in {@link Adaptive#generateSMSOTP}. This OTP shouldn't include the
   * correlation prefix (the four digits before the dash).
   * @return {Promise<Object>} The access and refresh tokens which should have
   * been received from the JWT validation, along with the <code>status</code>
   * property of <code>allow</code>.
   */
  async evaluateSMSOTP({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, otp) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);
    if (!transaction.smsotp) {
      throw new TransactionError(
          'This transaction has not initiated an SMS OTP verification.');
    }

    const smsOTPService = new SMSOTPService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await smsOTPService.verify(
        transaction.smsotp.verification.id, transaction.smsotp.enrollmentId,
        otp);
    console.log(`[${Adaptive.name}:evaluateSMSOTP(context, transactionId, ` +
        `otp)]`, 'verification:', verification);

    return this._validateAssertion(transactionId, context,
        verification.assertion, verification.userId);
  }

  /**
   * Request an Voice OTP.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * @param {string} enrollmentId The identifier of the enrollment to perform
   * second-factor verification with.
   * @return {Promise<Object>} The a four-digit correlation associated with the
   * verification.  This is not used by default in a Voice OTP call.
   */
  async generateVoiceOTP({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, enrollmentId) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const voiceOTPService = new VoiceOTPService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await voiceOTPService.generate(enrollmentId);
    console.log(`[${Adaptive.name}:generateVoiceOTP(context, transactionId, ` +
        `enrollmentId)]`, 'verification:', verification);

    // Update transaction in memory cache.
    this._transactionFunctions.updateTransaction(transactionId,
        {voiceotp: {enrollmentId, verification}});

    return {correlation: verification.correlation};
  }

  /**
   * Complete an Voice OTP second-factor verification and validate the resulting
   * JWT.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} otp The Voice OTP received on the phone after the Voice OTP
   * request in {@link Adaptive#generateVoiceOTP}. This OTP shouldn't include
   * the correlation prefix (the four digits before the dash).
   * @return {Promise<Object>} The access and refresh tokens which should have
   * been received from the JWT validation, along with the <code>status</code>
   * property of <code>allow</code>.
   */
  async evaluateVoiceOTP({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, otp) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);
    if (!transaction.voiceotp) {
      throw new TransactionError(
          'This transaction has not initiated an Voice OTP verification.');
    }

    const voiceOTPService = new VoiceOTPService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await voiceOTPService.verify(
        transaction.voiceotp.verification.id, transaction.voiceotp.enrollmentId,
        otp);
    console.log(`[${Adaptive.name}:evaluateVoiceOTP(context, transactionId, ` +
        `otp)]`, 'verification:', verification);

    return this._validateAssertion(transactionId, context,
        verification.assertion, verification.userId);
  }

  /**
   * Request knowledge questions.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} enrollmentId The identifier of the enrollment to perform
   * second-factor verification with.
   * @return {Promise<Object>} The knowledge questions to be answered.
   * @example <caption>Questions generation return value</caption>
   * {
   *   transactionId: '36a101c7-7426-4f45-ab3c-55f8dc075c6e',
   *   questions: [
   *     {
   *       questionKey: 'firstHouseStreet',
   *       question: 'What was the street name of the first house you lived in?'
   *     },
   *     {
   *       questionKey: 'bestFriend',
   *       question: 'What is the first name of your best friend?'
   *     },
   *     {
   *       questionKey: 'mothersMaidenName',
   *       question: 'What is your mothers maiden name?'
   *     }
   *   ]
   * }
   */
  async generateQuestions({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, enrollmentId) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const questionsService = new QuestionsService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await questionsService.generate(enrollmentId);
    console.log(`[${Adaptive.name}:generateQuestions(context, transactionId, ` +
        `enrollmentId)]`, 'verification:', verification);

    // Update transaction in memory cache.
    this._transactionFunctions.updateTransaction(transactionId, {questions:
      {enrollmentId, verification}});

    // Return questions to be answered.
    return {transactionId, questions: verification.questions};
  }

  /**
   * Complete a knowledge questions second-factor verification and validate the
   * resulting JWT.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {Object[]} questions The array of question keys and corresponding
   * answers to attempt verification with.
   * @param {string} questions[].questionKey The identifier of the question.
   * @param {string} questions[].answer The answer to the question.
   * @return {Promise<Object>} The result of the JWT validation. The result
   * object has a <code>status</code> property of <code>allow</code>, and
   * returns an access and a refresh token. There is no <code>requires</code>
   * status, since this is the last required verification step.
   * @throws {TransactionError} The transaction ID hasn't requested a knowledge
   * questions verification in {@link Adaptive#generateQuestions}.
   * @example <caption><code>allow</code> return value</caption>
   * {
   *   status: 'allow',
   *   token: {
   *     issued_at: 1420262924658,
   *     scope: 'READ',
   *     application_name: 'ce1e94a2-9c3e-42fa-a2c6-1ee01815476b',
   *     refresh_token_issued_at: 1420262924658,
   *     expires_in: 1799,
   *     token_type: 'BearerToken',
   *     refresh_token: 'fYACGW7OCPtCNDEnRSnqFlEgogboFPMm',
   *     client_id: '5jUAdGv9pBouF0wOH5keAVI35GBtx3dT',
   *     access_token: '2l4IQtZXbn5WBJdL6EF7uenOWRsi',
   *     organization_name: 'My Happy Place',
   *     refresh_token_expires_in: 86399
   *   }
   * }
   */
  async evaluateQuestions({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, questions) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);
    if (!transaction.questions) {
      throw new TransactionError(
          'This transaction has not initiated a knowledge questions ' +
          'verification.');
    }

    const questionsService = new QuestionsService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await questionsService.verify(
        transaction.questions.verification.id,
        transaction.questions.enrollmentId, questions);
    console.log(`[${Adaptive.name}:evaluateQuestions(context, transactionId, ` +
        `questions)]`, 'verification:', verification);

    return this._validateAssertion(transactionId, context,
        verification.assertion, verification.userId);
  }

  /**
   * Request a push notification verification.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @param {string} enrollmentId The identifier of the signature enrollment to
   * perform second-factor verification with.
   * @param {string} authenticatorId The identifier of the authenticator
   * belonging to the signature.
   * @param {string} message The verification message to be displayed in-app.
   * @param {string} pushNotificationTitle The title to be displayed
   * in the  push notification banner.
   * @param {string} pushNotificationMessage The message to be displayed
   * in the push notification banner.
   * @param {Object[]} additionalData An array of objects containing
   * <code>"name"</code> and <code>"value"</code> attributes to be displayed
   * in-app.
   * @return {Promise<Object>} <code>correlation</code> will contain
   * the confirmation number associated with the transaction.  This can be
   * displayed in the user agent to link transaction to verification request
   * in authenticator app.
   */
  async generatePush({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId, enrollmentId, authenticatorId,
  message, pushNotificationTitle, pushNotificationMessage, additionalData) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);

    const pushService = new PushService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl, context);

    const verification = await pushService.generate(enrollmentId,
        authenticatorId, message, context.ipAddress, context.userAgent,
        pushNotificationTitle, pushNotificationMessage, additionalData);
    console.log(`[${Adaptive.name}:generatePush(context, transactionId, ` +
        `enrollmentId, authenticatorId, message, pushNotificationTitle, ` +
        `pushNotificationMessage, additionalData)]`,
    'verification:', verification);

    // Update transaction in memory cache.
    this._transactionFunctions
        .updateTransaction(transactionId, {push: verification});

    return {correlation: verification.id.substr(0, 8)};
  }

  /**
   * Attempt a push notification verification.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} transactionId The identifier of the transaction received in
   * {@link Adaptive#assessPolicy}.
   * @return {Promise<Object>} The access and refresh tokens which should have
   * been received from the JWT validation, along with the <code>status</code>
   * property of <code>allow</code>.
   */
  async evaluatePush({sessionId, userAgent, ipAddress,
    evaluationContext='login'}, transactionId) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    const transaction = this._transactionFunctions
        .getTransaction(transactionId);
    if (!transaction.push) {
      throw new TransactionError(
          'This transaction has not initiated a push verification.');
    }

    const authenticatorId = transaction.push.authenticatorId;
    console.log(`[${Adaptive.name}:evaluatePush(transactionId)]`,
        'authenticatorId:', authenticatorId);

    const verificationId = transaction.push.id;
    console.log(`[${Adaptive.name}:evaluatePush(transactionId)]`,
        'verificationId:', verificationId);

    const pushService = new PushService(
        {accessToken: transaction.assessment.access_token},
        this._config.tenantUrl,
        context);

    const verification = await pushService.evaluate(authenticatorId,
        verificationId);
    console.log(`[${Adaptive.name}:evaluatePush(context, transactionId)]`,
        'verification:', verification);

    if (verification.state === 'VERIFY_SUCCESS') {
      return this._validateAssertion(transactionId, context,
          verification.assertion, verification.userId);
    }

    if (verification.state) {
      return {
        status: verification.state.toLowerCase(),
        expiry: verification.expiryTime,
        pushState: verification.pushNotification.sendState,
      };
    } else {
      return {status: 'error'};
    }
  }

  /**
   * Revoke the access token from OIDC.
   * @param {string} accessToken The access token to revoke from OIDC.
   */
  async logout(accessToken) {
    const tokenService = new TokenService({clientId: this._config.clientId,
      clientSecret: this._config.clientSecret}, this._config.tenantUrl, {});

    await tokenService.revokeAccessToken(accessToken);
  }

  /**
   * Initiate an OAuth Refresh flow to obtain updated tokens.
   * @param {Object} context The context to send for assessment.
   * @param {string} context.sessionId The session ID generated by the
   * user-agent, using an Adaptive client SDK.
   * @param {string} context.userAgent The user-agent, typically obtained form
   * the User-Agent HTTP header.
   * @param {string} context.ipAddress The IP address of the user-agent.
   * @param {string} [context.evaluationContext="login"] The stage in the
   * user-agent for which to perform an evaluation. (Used for continuous
   * assessment throughout the user-agent.) Different "stages" or "contexts"
   * will result in different evaluation results, as configured in the
   * sub-policies of the tenant application's policy. Possible options are
   * "login" (default), "landing", "profile", "resume", "highassurance",
   * "other".
   * @param {string} refreshToken The refresh token to refresh the access token
   * with.
   * @return {Promise<Object>} The policy evaluation result object. The result
   * object has a <code>status</code> property of either <code>allow</code>,
   * <code>deny</code>, or <code>requires</code>.
   * If <code>allow</code>, then <code>token</code> object contains refresh
   * response.
   * If <code>deny</code>, a <code>details</code> object is returned if an
   * error message was returned from the token endpoint.
   * If <code>requires</code>, a transaction is created, and the
   * <code>transactionId</code> and an array of <code>allowedFactors</code>
   * is also included in the result object, indicating that further
   * authentication is required.
   * @example <caption><code>allow</code> result object</caption>
   * {
   *   status: 'allow',
   *   token: {
   *     access_token: 'zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC',
   *     refresh_token: 'wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz',
   *     scope: 'openid',
   *     grant_id: 'a0b440b6-fefb-46ea-a603-e1040534cd28',
   *     id_token: 'eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA',
   *     token_type: 'Bearer',
   *     expires_in: 7120
   *   }
   * }
   * @example <caption><code>deny</code> result object</caption>
   * {
   *   status: 'deny',
   *   detail: {
   *     error_description: 'CSIAQ0158E The ... is invalid.',
   *     error: 'invalid_token'
   *   }
   * }
   * @example <caption><code>requires</code> result object</caption>
   * {
   *   status: 'requires',
   *   transactionId: '36a101c7-7426-4f45-ab3c-55f8dc075c6e',
   *   enrolledFactors: [
   *     {
   *       id: '61e39f0a-836b-48fa-b4c9-cface6a3ef5a',
   *       userId: '60300035KP',
   *       type: 'emailotp',
   *       created: '2020-06-15T02:51:49.131Z',
   *       updated: '2020-06-15T03:15:18.896Z',
   *       attempted: '2020-07-16T04:30:14.066Z',
   *       enabled: true,
   *       validated: true,
   *       attributes: {
   *         emailAddress: 'email@email.com'
   *       }
   *     }
   *   ]
   * }
   */
  async refresh({sessionId, userAgent, ipAddress, evaluationContext='login'},
      refreshToken) {
    const context = {sessionId, userAgent, ipAddress, evaluationContext};
    let assessment;
    try {
      const tokenService = new TokenService({clientId: this._config.clientId,
        clientSecret: this._config.clientSecret}, this._config.tenantUrl,
      context);
      assessment = await tokenService.refreshAccessToken(refreshToken);

      console.log(`[${Adaptive.name}:refresh(refreshToken, ` +
           `context)]`, 'assessment:', assessment);

      if (!assessment.allowedFactors) {
        // No 2FA required, return token.
        return {status: 'allow', token: assessment};
      }
    } catch (error) {
      // Deny assessment.
      console.log(`[${Adaptive.name}:refresh(refreshToken, context)]`,
          'error:', error);
      const jsonResp = {status: 'deny'};
      if (error.response.data) {
        jsonResp.detail = error.response.data;
      }
      return jsonResp;
    }
    // Further 2FA is required.

    // Create transaction and store in memory cache.
    const transaction = {assessment};
    const transactionId = this._transactionFunctions
        .createTransaction(transaction);

    const factorService = new FactorService(
        {accessToken: assessment.access_token},
        this._config.tenantUrl, context);

    // Get Factors enrollments for the current user.
    const enrollments = await factorService.getEnrollments();
    console.log(`[${Adaptive.name}:refresh(refreshToken, context)]`,
        'enrollments:', enrollments);

    // Filter the user's enrollment options based on the assessment's
    // `allowedFactors`.
    const enrolledFactors = enrollments.factors.filter((enrollment) => {
      const normalizedType = enrollment.subType
        ? `${enrollment.type}s_${enrollment.subType}`
        : enrollment.type;

      console.log(`[${Adaptive.name}:refresh(refreshToken, context)]`, 'Checking normalizedType:', normalizedType);
      return assessment.allowedFactors.includes(normalizedType);
    });
    console.log(`[${Adaptive.name}:refresh(refreshToken, context)]`,
        'enrolledFactors:', enrolledFactors);

    return {status: 'requires', enrolledFactors, transactionId};
  }

  /**
   * Introspect a refresh or access token on OIDC.
   * @param {string} token The refresh or access token to introspect.
   * @param {string} [tokenTypeHint] The token type. This attribute is an
   * optional hint about the token that is being introspected. Possible values
   * are <code>access_token</code> and <code>refresh_token</code>.
   * @return {Promise<Object>} An object containing an <code>"active"</code>
   * property indicating whether the introspected token is valid or invalid.
   * Other properties are also included in the introspection result when the
   * <code>"active"</code> status is <code>true</code>.
   */
  async introspect(token, tokenTypeHint) {
    const tokenService = new TokenService({clientId: this._config.clientId,
      clientSecret: this._config.clientSecret}, this._config.tenantUrl, {});

    return tokenService.introspectToken(token, tokenTypeHint);
  }

  /**
   * Return an Express middleware to introspect an access token on OIDC. The
   * access token to introspect should be in the 'Authorization' header of the
   * request.
   * @param {Object} [config] The configuration settings used for the token
   * introspection middleware.
   * @param {number} [config.cacheMaxSize=0] The maximum size of the cache, i.e.
   * the maximum number of successful token introspection responses to cache. If
   * the cache becomes full, the least-recently-used introspection result will
   * be removed. A value of 0 means no maximum size, i.e. infinity. This value
   * is ignored after first initialisation (i.e. after first call to function).
   * @param {number} [config.cacheTTL=0] The time (in seconds) to cache a
   * successful introspection result for. If a successful token introspection
   * is done, the result will be cached for the period of time provided, to save
   * expensive introspection calls on each subsequent request. A value of 0 will
   * cache the introspect response for the lifetime of the token as provided in
   * the <code>exp</code> property of the introspect response.
   * @param {boolean} [config.denyMFAChallenge=true] A flag indicating
   * whether an introspected token response with a <code>scope</code> of
   * <code>'mfa_challenge'</code> should be denied. If <code>true</code>, tokens
   * with <code>scope</code> of <code>'mfa_challenge'</code> will be rejected.
   * If <code>false</code>, the <code>scope</code> of tokens will be
   * disregarded.
   * @return {Function} The Express middleware function.
   */
  introspectMiddleware(config={cacheMaxSize: 0, cacheTTL: 0,
    denyMFAChallenge: true}) {
    return async (req, res, next) => {
      try {
        if (config.cacheMaxSize === undefined) {
          throw new ConfigurationError(
              `Cannot find property 'cacheMaxSize' in configuration settings.`);
        } else if (config.cacheTTL === undefined) {
          throw new ConfigurationError(
              `Cannot find property 'cacheTTL' in configuration settings.`);
        } else if (config.denyMFAChallenge === undefined) {
          throw new ConfigurationError(`Cannot find property ` +
              `'denyMFAChallenge' in configuration settings.`);
        }

        console.log(`[${Adaptive.name}:introspectMiddleware([config])]`,
            'config.cacheMaxSize:', config.cacheMaxSize);
        console.log(`[${Adaptive.name}:introspectMiddleware([config])]`,
            'config.cacheTTL:', config.cacheTTL);
        console.log(`[${Adaptive.name}:introspectMiddleware([config])]`,
            'config.denyMFAChallenge:', config.denyMFAChallenge);

        // Initialise a cache for storing introspection results, if not
        // initialised already.
        if (!this._introspectCache) {
          this._introspectCache = new LRU(config.cacheMaxSize);
        }

        const authorizationHeader = req.headers['authorization'].split(' ');
        const accessToken = authorizationHeader[1];
        if (authorizationHeader[0].toLowerCase() === 'bearer' && accessToken) {
          const cachedIntrospectResponse = this._introspectCache
              .get(accessToken);
          const introspectResponse = cachedIntrospectResponse ||
              await this.introspect(accessToken, 'access_token');
          console.log(`[${Adaptive.name}:introspectMiddleware([config])]`,
              'introspectResponse:', introspectResponse);
          if (introspectResponse && introspectResponse.active &&
            (introspectResponse.scope !== 'mfa_challenge' ||
            !config.denyMFAChallenge)) {
            // Successful introspection.
            // Cache introspection if not cached already.
            if (!cachedIntrospectResponse) {
              const expiresIn = introspectResponse.exp * 1000 - Date.now();
              const cacheTTLMilliseconds =
                  (config.cacheTTL === 0 ? expiresIn : config.cacheTTL * 1000);
              console.log(`[${Adaptive.name}:introspectMiddleware([config])]`,
                  'cacheTTLMilliseconds:', cacheTTLMilliseconds);
              this._introspectCache.set(accessToken, introspectResponse,
                  cacheTTLMilliseconds);
            }
            next();
            return;
          }
        }

        throw new TokenError('Token introspection failed.');
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = Adaptive;
