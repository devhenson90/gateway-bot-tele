import { DBLogging } from "artifacts/logger/core/db.logger";

export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 4002, // need to change port for particular services
  MICROSERVICE_PORT: parseInt(process.env.MICROSERVICE_PORT, 10) || 4200,
  HOST: '0.0.0.0',
  MODULE: process.env.MODULE,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
  AUTH_PUBLIC_KEY: process.env.PUBLIC_KEY,
  AUTH_KEY: {
    [process.env.PUBLIC_KEY]: process.env.PRIVATE_KEY,
  },
  RECAPTCHA_CONFIG: {
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    RECAPTCHA_SITE_VERIFY: process.env.RECAPTCHA_SITE_VERIFY,
  },
  PG_DB_CONFIG: {
    dbuser: process.env.DB_DBUSER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    ssl: process.env.DB_SSL !== 'false' ? true : false,
    raw: true,
    logging: process.env.DB_LOGGING !== 'false' ? DBLogging : undefined,
  },
  SCB_API_CONFIG: {
    endpoint: process.env.SCB_API_ENDPOINT,
    apiKey: process.env.SCB_API_KEY,
    secretKey: process.env.SCB_API_SECRET,
    merchantId: process.env.SCB_MERCHANT_ID,
    terminalId: process.env.SCB_TERMINAL_ID,
    billerId: process.env.SCB_BILLER_ID,
  },
  IS_LOCAL: process.env.IS_LOCAL !== 'false' ? true : false,
  S3_UPLOAD_BUCKET: process.env.S3_UPLOAD_BUCKET,
  AWS_CREDENTIALS: {
    access_key: process.env.AWS_ACCESS_KEY_ID,
    secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
    default_region: process.env.AWS_DEFAULT_REGION,
  },
  RPA_ARTIFACT_PATH: process.env.RPA_ARTIFACT_PATH,
  NATS_SERVER: [
    {
      servers: process.env.NATS_HOST,
      maxReconnectAttempts: -1,
      user: process.env.NATS_USERNAME,
      pass: process.env.NATS_PASSWORD,
      name: process.env.NATS_NAME,
    },
  ],
  NATS: {
    NATS_HOST: process.env.NATS_HOST,
    NATS_SUBSCRIBE_SUBJECT: process.env.NATS_SUBSCRIBE_SUBJECT
  },
  AES_KEY: process.env.AES_KEY,
  AES_IV: process.env.AES_IV,
  BACKEND_URL: process.env.BACKEND_URL,
  STRIPE_CONFIG: {
    endpointApi: process.env.STRIPE_ENDPOINT_API,
    publicKey: process.env.STRIPE_PUBLIC_KEY_API,
    secretKey: process.env.STRIPE_SECRET_KEY_API,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  ENV_SITE: process.env.ENV_SITE,
  TOP_UP_MODE: process.env.TOP_UP_MODE,
  BANK_ACCOUNT_NAME: process.env.BANK_ACCOUNT_NAME,
  BANK_ACCOUNT_NUMBER: process.env.BANK_ACCOUNT_NUMBER
});
