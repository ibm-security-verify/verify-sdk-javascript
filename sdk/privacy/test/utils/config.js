// Copyright contributors to the IBM Security Verify Privacy SDK
// for JavaScript project

// load contents of .env into process.env
const dotEnvPath = __dirname + '/../.env';
require('dotenv').config({path: dotEnvPath});
const OAuth = require('./oauth');

const Config = {
  tenantUrl: process.env.TENANT_URL,
};

const Auth = {
  accessToken: process.env.ACCESS_TOKEN,
};

const Context = {
  ipAddress: (process.env.IP_ADDRESS ? process.env.IP_ADDRESS : null),
  subjectId: (process.env.SUBJECT_ID ? process.env.SUBJECT_ID : null),
  isExternalSubject: (process.env.isExternalSubject &&
      process.env.isExternalSubject == 'true' ? true : false),
};

checkConfig = async () => {
  if (!Config.tenantUrl || Config.tenantUrl == '') {
    throw new Error('TENANT_URL is missing from the env');
  }

  if (!Auth.accessToken || Auth.accessToken == '') {
    const data = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: process.env.GRANT_TYPE,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    };

    const tokenData = await OAuth.getToken(Config.tenantUrl +
        '/oidc/endpoint/default/token', data);
    Auth.accessToken = tokenData.access_token;
  }
};

module.exports = {
  Config,
  Auth,
  Context,
  checkConfig,
};
