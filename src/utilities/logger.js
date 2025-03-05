import { createLogger, format, transports } from 'winston';
import { ROOT_PATH } from '../../global-constants.js';

const { combine, timestamp, printf, errors } = format;

async function buildLogger(LOGGER_NAME) {
  transports.DailyRotateFile = (
    await import('winston-daily-rotate-file')
  ).default;
  const logFormat = printf((info) => {
    return `${info.timestamp}\n${info.level}: ${info.message}\n`;
  });

  const dailyRotateFileTransportOptions = {
    level: 'error',
    filename: `${ROOT_PATH}/logs/${LOGGER_NAME}.%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: true,
    maxSize: '32m',
    maxFiles: '365d',
  };
  const consoleTransportOptions = { level: 'verbose' };
  return createLogger({
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
    transports: [
      new transports.Console(consoleTransportOptions),
      new transports.DailyRotateFile(dailyRotateFileTransportOptions),
    ],
  });
}

export default buildLogger;
