import { ServerOptions } from './types/ServerOptions';

export default {
  secretKey: process.env.SECRET_KEY || 'Mestre888',
  host: process.env.HOST || 'http://localhost',
  port: process.env.PORT || '21465',
  deviceName: process.env.DEVICE_NAME || 'WppConnect',
  poweredBy: 'Unicaclub-WPPConnect-Server',
  startAllSession: process.env.START_ALL_SESSION === 'true' || true,
  tokenStoreType: process.env.TOKEN_STORE_TYPE || 'file',
  maxListeners: parseInt(process.env.MAX_LISTENERS || '15'),
  customUserDataDir: process.env.USER_DATA_DIR || './userDataDir/',
  webhook: {
    url: process.env.WEBHOOK_URL || null,
    autoDownload: process.env.WEBHOOK_AUTO_DOWNLOAD === 'true' || true,
    uploadS3: process.env.WEBHOOK_UPLOAD_S3 === 'true' || false,
    readMessage: process.env.WEBHOOK_READ_MESSAGE === 'true' || true,
    allUnreadOnStart: process.env.WEBHOOK_ALL_UNREAD_ON_START === 'true' || false,
    listenAcks: process.env.WEBHOOK_LISTEN_ACKS === 'true' || true,
    onPresenceChanged: process.env.WEBHOOK_ON_PRESENCE_CHANGED === 'true' || true,
    onParticipantsChanged: process.env.WEBHOOK_ON_PARTICIPANTS_CHANGED === 'true' || true,
    onReactionMessage: process.env.WEBHOOK_ON_REACTION_MESSAGE === 'true' || true,
    onPollResponse: process.env.WEBHOOK_ON_POLL_RESPONSE === 'true' || true,
    onRevokedMessage: process.env.WEBHOOK_ON_REVOKED_MESSAGE === 'true' || true,
    onLabelUpdated: process.env.WEBHOOK_ON_LABEL_UPDATED === 'true' || true,
    onSelfMessage: process.env.WEBHOOK_ON_SELF_MESSAGE === 'true' || false,
    ignore: (process.env.WEBHOOK_IGNORE || 'status@broadcast').split(','),
  },
  websocket: {
    autoDownload: process.env.WEBSOCKET_AUTO_DOWNLOAD === 'true' || false,
    uploadS3: process.env.WEBSOCKET_UPLOAD_S3 === 'true' || false,
  },
  chatwoot: {
    sendQrCode: process.env.CHATWOOT_SEND_QR_CODE === 'true' || true,
    sendStatus: process.env.CHATWOOT_SEND_STATUS === 'true' || true,
  },
  archive: {
    enable: process.env.ARCHIVE_ENABLE === 'true' || false,
    waitTime: parseInt(process.env.ARCHIVE_WAIT_TIME || '10'),
    daysToArchive: parseInt(process.env.ARCHIVE_DAYS_TO_ARCHIVE || '45'),
  },
  log: {
    level: process.env.LOG_LEVEL || 'silly',
    logger: (process.env.LOG_LOGGER || 'console,file').split(','),
  },
  createOptions: {
    browserArgs: [
      '--disable-web-security',
      '--no-sandbox',
      '--disable-web-security',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
    ],
    /**
     * Example of configuring the linkPreview generator
     * If you set this to 'null', it will use global servers; however, you have the option to define your own server
     * Clone the repository https://github.com/wppconnect-team/wa-js-api-server and host it on your server with ssl
     *
     * Configure the attribute as follows:
     * linkPreviewApiServers: [ 'https://www.yourserver.com/wa-js-api-server' ]
     */
    linkPreviewApiServers: null,
  },
  mapper: {
    enable: false,
    prefix: 'tagone-',
  },
  db: {
    mongodbDatabase: process.env.MONGODB_DATABASE || 'tokens',
    mongodbCollection: process.env.MONGODB_COLLECTION || '',
    mongodbUser: process.env.MONGODB_USER || '',
    mongodbPassword: process.env.MONGODB_PASSWORD || '',
    mongodbHost: process.env.MONGODB_HOST || '',
    mongoIsRemote: process.env.MONGO_IS_REMOTE === 'true' || true,
    mongoURLRemote: process.env.MONGO_URL_REMOTE || '',
    mongodbPort: parseInt(process.env.MONGODB_PORT || '27017'),
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379'),
    redisPassword: process.env.REDIS_PASSWORD || '',
    redisDb: parseInt(process.env.REDIS_DB || '0'),
    redisPrefix: process.env.REDIS_PREFIX || 'docker',
  },
  aws_s3: {
    region: (process.env.AWS_S3_REGION || 'sa-east-1') as any,
    access_key_id: process.env.AWS_S3_ACCESS_KEY_ID || null,
    secret_key: process.env.AWS_S3_SECRET_KEY || null,
    defaultBucketName: process.env.AWS_S3_DEFAULT_BUCKET_NAME || null,
    endpoint: process.env.AWS_S3_ENDPOINT || null,
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true' || null,
  },
  automation: {
    enabled: process.env.AUTOMATION_ENABLED !== 'false',
    mongodb: {
      uri: process.env.MONGODB_URI || process.env.MONGO_URL || '',
      database: process.env.MONGODB_DATABASE || 'wppconnect_automation'
    },
    queue: {
      processInterval: parseInt(process.env.QUEUE_PROCESS_INTERVAL || '5000'),
      maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3'),
      cleanupInterval: parseInt(process.env.QUEUE_CLEANUP_INTERVAL || '86400000') // 24 hours
    },
    analytics: {
      enabled: process.env.ANALYTICS_ENABLED !== 'false',
      retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '90')
    },
    channels: {
      telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      },
      instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
        pageId: process.env.INSTAGRAM_PAGE_ID || '',
        verifyToken: process.env.INSTAGRAM_VERIFY_TOKEN || 'wppconnect_verify'
      },
      sms: {
        provider: process.env.SMS_PROVIDER || 'twilio',
        twilio: {
          accountSid: process.env.TWILIO_ACCOUNT_SID || '',
          authToken: process.env.TWILIO_AUTH_TOKEN || '',
          phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
        }
      },
      email: {
        provider: process.env.EMAIL_PROVIDER || 'smtp',
        smtp: {
          host: process.env.SMTP_HOST || '',
          port: parseInt(process.env.SMTP_PORT || '587'),
          user: process.env.SMTP_USER || '',
          password: process.env.SMTP_PASSWORD || '',
          from: process.env.SMTP_FROM || ''
        }
      }
    }
  },
} as unknown as ServerOptions;
