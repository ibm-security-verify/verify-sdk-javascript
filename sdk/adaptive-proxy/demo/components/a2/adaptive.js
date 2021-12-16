// Import the Adaptive SDK.
const Adaptive = require('../../../lib/adaptive');
// TODO: The above 'require' statement should normally be
// `require('adaptive-proxy-sdk')` after installing the 'adaptive-proxy-sdk' npm
// package.

// Load contents of `.env` into `process.env`.
require('dotenv').config();

const config = {
  tenantUrl: process.env.TENANT_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
};

module.exports = new Adaptive(config);
