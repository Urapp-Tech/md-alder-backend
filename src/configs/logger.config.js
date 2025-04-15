import createLogger from '../utilities/logger.js';

const adminLogger = await createLogger('ADMIN_LOGGER');
const appLogger = await createLogger('APP_LOGGER');

function loggerConfig() {
  return {
    loggers: [
      { path: '/api/v1/admin', logger: adminLogger },
      { path: '/api/v1/super-admin', logger: adminLogger },
      { path: '/api/v1/system/config', logger: adminLogger },
      { path: '/api/v1/app', logger: appLogger },
    ],
  };
}

export default loggerConfig;
