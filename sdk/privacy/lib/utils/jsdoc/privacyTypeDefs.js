// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

/**
 * The assessment decision object for a specific request item
 * @typedef {Object} AssessmentDecision
 * @property {string} attributeId The attribute identifier is only included
 * if the request doesn't specify an attribute to be assessed.
 * @property {boolean} approved Indicates if the request has been approved
 * @property {boolean} requiresConsent Indicates if user consent is required.
 * This does not imply that an existing consent is positive if this value
 * is set to false.
 * @property {VerifyError} reason If "approved" is false, the details
 * of the denial
 */

/**
 * The assessment object for a specific request item
 * @typedef {Object} Assessment
 * @property {string} purposeId The purpose or EULA ID representing the privacy
 * purpose or EULA configured on Verify.
 * @property {string} accessTypeId The access type ID representing one of the
 * available access types on Verify. This is one of the access types configured
 * for the purpose and optionally the attribute.
 * @property {string} attributeId The attribute ID on Verify. This is one of the
 * attributes for the purpose.
 * @property {string} attributeValue The attribute value provided in the
 * request.
 * @property {AssessmentDecision[]} result The assessment decision objects. This
 * might contain more than one object if the request does not include a
 * specific attribute. In this case, the result contains the corresponding
 * <code>attributeId</code>.
 */

/**
 * The assessment response object
 * @typedef {Object} WrappedAssessment
 * @property {string} status The overall assessment status is computed based on
 * the contents of the assessment.
 * <br><code>approved</code> - all items are approved
 * <br><code>consent</code> - some or all items require consent
 * <br><code>multistatus</code> - none of the items require consent but some
 * items are approved and others are denied because of user action (opt-out)
 * or policy rule <br><code>denied</code> - approval is denied for all items
 * <br><code>error</code> - invalid request or system error
 * @property {Assessment[]} assessment The assessment details for each requested
 * item
 * @property {VerifyError} error The error details if the status is "error"
 */

/**
 * The consent record
 * @typedef {Object} Consent
 * @property {string} purposeId The purpose or EULA ID representing the privacy
 * purpose or EULA configured on Verify.
 * @property {string} accessTypeId The access type ID representing one of the
 * available access types on Verify. This is one of the access types configured
 * for the purpose and optionally the attribute.
 * @property {string} attributeId The attribute ID on Verify. This is one of the
 * attributes for the purpose.
 * @property {string} attributeValue The attribute value for the attribute.
 * This is typically used when the user has more than one value for the
 * attribute and is consenting to a specific value.
 * @property {number} startTime The time since Epoch (in seconds) that
 * indicates when the consent becomes active.
 * @property {number} endTime The time since Epoch (in seconds) that indicates
 * when the consent elapses.
 * @property {boolean} isGlobal Indicates if the consent applies to all
 * applications
 * @property {number} status This is the status of the consent and can be
 * one of -
 * <br><code>1</code> - Active
 * <br><code>2</code> - Expired
 * <br><code>3</code> - Inactive
 * <br><code>8</code> - New consent required
 * @property {ConsentTypesEnum} state This is the consent type provided by the
 * user
 * @property {string} geoIP This is the IP address where the user consents
 * @property {Array} customAttributes This is a list of optional attributes.
 * Object type within the array is
 * <code>{ "name": "somekey", "value": "somevalue" }</code>
 */

/**
 * The consent metadata record
 * @typedef {Object} MetadataRecord
 * @property {string} purposeId The purpose or EULA ID representing the privacy
 * purpose or EULA configured on Verify.
 * @property {string} purposeName The purpose or EULA name
 * @property {string} accessTypeId The access type ID representing one of the
 * available access types on Verify. This is one of the access types configured
 * for the purpose and optionally the attribute.
 * @property {string} accessType The access type name
 * @property {string} attributeId The attribute ID on Verify. This is one of the
 * attributes for the purpose.
 * @property {string} attributeName The attribute name
 * @property {string} attributeValue The attribute value in the consent record.
 * @property {number} defaultConsentDuration The default duration configured for
 * the user consent. This applies if no explicit start and end time is provided.
 * @property {boolean} assentUIDefault Indicates if the consent prompt should
 * default the selection to "accepted"
 * @property {ConsentDisplayTypesEnum} consentType Indicates the type of consent
 * that needs to be collected and stored. If the value is
 * <code>ConsentDisplayTypes.DO_NOT_SHOW<code>, do not show a consent request
 * to the user.
 * @property {string} termsOfUseRef The terms of use if this record references
 * a EULA.
 * @property {string} status The current status of consent. This can be one of -
 * <br><code>NONE</code> - No consent
 * <br><code>ACTIVE</code> - An active consent record exists. However, the
 * consent may not translate to "yes".
 * <br><code>NOT_ACTIVE</code> - A user consent record exists but the start
 * time is in the future.
 * <br><code>EXPIRED</code> - A user consent record exists but it is no longer
 * valid. This may be due to a new privacy rule or a change in configuration or
 * the consent has lapsed.
 * @property {Consent} consent The user consent record that may or may not
 * be active.
 */

/**
 * The consent metadata object that contains records based on the request
 * @typedef {Object} Metadata
 * @property {Array.<MetadataRecord>} eula The metadata records related
 * to the EULA category
 * @property {Array.<MetadataRecord>} default The metadata records related
 * to the default purpose-aware attribute category
 */

/**
 * The consent metadata response object
 * @typedef {Object} WrappedMetadata
 * @property {string} status The overall metadata status is computed based
 * on whether the data was received or not.
 * <br><code>done</code> - the metadata is retrieved
 * <br><code>error</code> - invalid request or system error
 * @property {Metadata} metadata The metadata for rendering a consent page
 * @property {VerifyError} error The error details if the status is "error"
 */

/**
 * The response object for <code>getUserConsents</code>
 * @typedef {Object} WrappedGetUserConsents
 * @property {string} status The overall status is computed based on whether
 * the data was received or not.
 * <br><code>done</code> - the consents are retrieved
 * <br><code>error</code> - invalid request or system error
 * @property {Consent[]} consents The list of consents
 * @property {VerifyError} error The error details if the status is "error"
 */

/**
 * The consent operation result
 * @typedef {Object} ConsentOpResultValue
 * @property {string} id The consent record identifier
 * @property {string} purposeId The purpose or EULA ID representing the privacy
 * purpose or EULA configured on Verify.
 * @property {string} accessTypeId The access type ID representing one of the
 * available access types on Verify. This is one of the access types configured
 * for the purpose and optionally the attribute.
 * @property {string} attributeId The attribute ID on Verify. This is one of the
 * attributes for the purpose.
 * @property {string} attributeValue The attribute value for the attribute.
 * This is typically used when the user has more than one value for the
 * attribute and is consenting to a specific value.
 * @property {ConsentTypesEnum} state This is the consent type provided by the
 * user.
 */

/**
 * The consent operation result
 * @typedef {Object} ConsentOpResult
 * @property {string} result The result of the operation can be
 * <code>success</code> or <code>failure</code>
 * @property {ConsentOpResultValue} value The consent storage request record
 * @property {string} error The error if the result is <code>failure<code>
 */

/**
 * The response object for <code>storeUserConsents</code>
 * @typedef {Object} WrappedStoreUserConsents
 * @property {string} status The overall status is computed based on whether
 * the data was received or not.
 * <br><code>success</code> - the consents have been saved successfully
 * <br><code>fail</code> - some or all consents could not be saved.
 * Check <code>results</code> for the reason
 * <br><code>error</code> - invalid request or system error
 * @property {ConsentOpResult[]} results The results of consent operation.
 * This should be consulted when the status is <code>fail</code>
 * @property {VerifyError} error The error details if the status is "error"
 */

/**
 * Enumeration of different possible consent display types
 * @typedef {number} ConsentDisplayTypesEnum
 * @property {number} DO_NOT_SHOW No consent needs to be collected or recorded
 * and do not show the user the request.
 * @property {number} TRANSPARENT User is shown the consent record but cannot
 * choose to deny. Set <code>ConsentTypes.TRANSPARENT</code> as the consent
 * state.
 * @property {number} OPTIN_OR_OUT User has to opt-in or opt-out. If the user
 * approves of the consent request, use <code>ConsentTypes.OPTIN</code>. If the
 * user denies, use <code>ConsentTypes.OPTOUT</code>.
 * @property {number} ALLOW_OR_DENY User has to allow or deny. If the user
 * approves of the consent request, use <code>ConsentTypes.ALLOW</code>. If the
 * user denies, use <code>ConsentTypes.DENY</code>.
 */

/**
 * Enumeration of different possible consent types
 * @typedef {number} ConsentTypesEnum
 * @property {number} ALLOW Usual consent that is not governed by any
 * regulation. This is the consent type expected if the user chose to
 * approve the request and the consent display type returned by
 * <code>getConsentMetadata</code> is
 * <code>ConsentDisplayTypes.ALLOW_OR_DENY</code>.
 * @property {number} DENY Usual consent that is not governed by any regulation.
 * This is the consent type expected if the user chose to not approve the
 * request and the consent display type returned by
 * <code>getConsentMetadata</code> is
 * <code>ConsentDisplayTypes.ALLOW_OR_DENY</code>.
 * @property {number} OPTIN Opt-in required based on the assessment.
 * This is the consent type expected if the user chose to
 * approve the request and the consent display type returned by
 * <code>getConsentMetadata</code> is
 * <code>ConsentDisplayTypes.OPTIN_OR_OUT</code>.
 * @property {number} OPTOUT Opt-out required based on the assessment. This is
 * the consent type expected if the user chose to not approve the request
 * and the consent display type returned by
 * <code>getConsentMetadata</code> is
 * <code>ConsentDisplayTypes.OPTIN_OR_OUT</code>.
 * @property {number} TRANSPARENT User opted to implicitly consent. This is the
 * consent type expected when the consent display type returned by
 * <code>getConsentMetadata</code> is
 * <code>ConsentDisplayTypes.TRANSPARENT</code>.
 */
