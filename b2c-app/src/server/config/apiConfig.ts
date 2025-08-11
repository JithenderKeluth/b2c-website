import dotenv from 'dotenv';
dotenv.config();

const env = process.env.ENV || 'preprod';

const baseUrls = {
  beta: 'https://beta-tsacc.travelstart.com',
  preprod: 'https://preprod-tsacc.travelstart.com',
  production: 'https://tsacc.travelstart.com'
};

const hotelsBaseUrl = {
  beta: 'https://hapi-service-beta.hotelsapi.net',
  preprod: 'https://hapi-service-beta.hotelsapi.net',
  production: 'https://hapi-service-prod-v2.hotelsapi.net'
};

const webApiUrls = {
  beta: 'https://beta-wapi.travelstart.com',
  preprod: 'https://preprod-wapi.travelstart.com',
  production: 'https://wapi.travelstart.com'
};

const momentum_partnerProxyUrls = {
  beta: 'https://connect-staging.travelstart.com',
  preprod: 'https://connect-staging.travelstart.com',
  production: 'https://connect.travelstart.com'
};

const peachUrls = {
  beta: 'https://eu-prod.oppwa.com',
  preprod: 'https://eu-prod.oppwa.com',
  production: 'https://eu-prod.oppwa.com'
};

const peachEntityId = {
  beta: '8ac9a4cb8c3e67ec018c68e61036628c',//process.env.PEACH_ENTITY_ID_BETA || '',
  preprod: process.env.PEACH_ENTITY_ID_PREPROD || '',
  production: process.env.PEACH_ENTITY_ID_PROD || ''
};

const peachAuthorizationToken = {
  beta: 'OGFjOWE0Y2U4NmMwYjZlNjAxODZkZjhhNGI3NjE3MWR8RVBucUZucUJFOA==',//process.env.PEACH_AUTH_TOKEN_BETA || '',
  preprod: process.env.PEACH_AUTH_TOKEN_PREPROD || '',
  production: process.env.PEACH_AUTH_TOKEN_PROD || ''
};

const resendTicketToken = {
  beta: process.env.RESEND_TICKET_TOKEN_BETA || '',
  preprod: process.env.RESEND_TICKET_TOKEN_PREPROD || '',
  production: process.env.RESEND_TICKET_TOKEN_PROD || ''
};

const momentumBearerToken = {
  beta: process.env.BETA_MOMENTUM_BEARER_TOKEN || '',
  preprod: process.env.PREPROD_MOMENTUM_BEARER_TOKEN || '',
  production: process.env.PROD_MOMENTUM_BEARER_TOKEN || ''
};

const peachSubscriptionAmount = {
  beta: 1,
  preprod: 1,
  production: 2340
};

const peachSubscriptionRenewalAmount = {
  beta: 1,
  preprod: 1,
  production: 1999
};

const freshDesk = {
  url : 'https://travelstartassist.freshdesk.com/api/v2/'
};

const hotelsCredentialsMap: Record<string, any> = {
  momentum: {
    email: 'hotels@momentum.co.za',
    password: 'y4b9EZ8q8@'
  },
  default: {
    email: "tsplus@travelstartplus.com",
    password: "Y@&ampi1R7cRuYf@Vd$C"
  }
};

export const getHotelsCredentials = (identifier: string) => {
  return hotelsCredentialsMap[identifier] || hotelsCredentialsMap["default"];
};

export const apiConfig = {
  env: env,
  baseUrl: baseUrls[env],
  webApiUrl: webApiUrls[env],
  hotelsBaseUrl: hotelsBaseUrl[env],
  freshDesk: freshDesk.url,
  resendTicketToken: resendTicketToken[env],
  peachUrls: peachUrls[env],
  peachEntityId: peachEntityId[env],
  peachAuthorizationToken: peachAuthorizationToken[env],
  peachLogs: 'https://beta-check-in.travelstart.com/tslogs',
  peachSubscriptionAmount: peachSubscriptionAmount[env],
  peachSubscriptionRenewalAmount: peachSubscriptionRenewalAmount[env],
  momentumBearerToken: momentumBearerToken[env],
  mm_partnerProxyUrls: momentum_partnerProxyUrls[env],
  headers: {
    json: { 'Content-Type': 'application/json' }
  },
  secrets: {
    FRESH_DESK_AUTHORIZATION_KEY: process.env.FRESH_DESK_AUTHORIZATION_KEY || '',
    UPDATE_PWD_TOKEN: process.env.UPDATE_PWD_TOKEN || '',
    BIN_DATA_API_SECRET_KEY: process.env.BIN_DATA_API_SECRET_KEY || '',
    BIN_DATA_API_ACCESS_KEY: process.env.BIN_DATA_API_ACCESS_KEY || '',
    PROXY_TEST_BEARER_TOKEN: process.env.PROXY_TEST_BEARER_TOKEN || '',
    PROXY_PROD_BEARER_TOKEN: process.env.PROXY_PROD_BEARER_TOKEN || '',
    BIN_DATA_API_REGION: process.env.BIN_DATA_API_REGION || '',
    BIN_DATA_API_FUNCTION: process.env.BIN_DATA_API_FUNCTION || '',
    BUTTERCMS_KEY: process.env.BUTTERCMS_KEY || '',
    ITERABLE_API_KEY_SHARED_SECRET: process.env.ITERABLE_API_KEY_SHARED_SECRET || '',
    COOKIE_ENCRYPTION_KEY: process.env.COOKIE_ENCRYPTION_KEY || ''
  }
};