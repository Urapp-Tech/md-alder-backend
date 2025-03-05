/* eslint-disable no-console */

console.clear();

import bcryptConfig from '#configs/bcrypt.config';
import envConfig from '#configs/env.config';
import JWTConfig from '#configs/jwt.config';
import knexConfig from '#configs/knex.config';
import loggerConfig from '#configs/logger.config';
import mailerConfig from '#configs/mailer.config';
import multipartConfig from '#configs/multipart.config';
import redisConfig from '#configs/redis.config';
import s3Config from '#configs/s3.config';
import { swaggerConfig, swaggerUIConfig } from '#configs/swagger.config';
import fastifyJWT from '#plugins/jwt.plugin';
import fastifyKnex from '#plugins/knex.plugin';
import fastifyLogger from '#plugins/logger.plugin';
import fastifyMailer from '#plugins/mailer.plugin';
import fastifyS3 from '#plugins/s3.plugin';
import routes from '#src/routes';
import HTTP_STATUS from '#utilities/http-status';
import fastifyCORS from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart';
import fastifyRedis from '@fastify/redis';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';
import { fastifyBcrypt } from 'fastify-bcrypt';
import fastifyPlugin from 'fastify-plugin';

process.env.TZ = 'UTC';

function ajvFilePlugin(ajv) {
  return ajv.addKeyword({
    keyword: 'isFile',
    compile: (_schema, parent) => {
      parent.type = 'file';
      delete parent.isFile;
      return () => true;
    },
  });
}

const server = fastify({
  logger: false,
  genReqId: () => crypto.randomUUID(),
  ajv: {
    plugins: [ajvFilePlugin],
    customOptions: {
      keywords: ['collectionFormat'],
    },
  },
});

await server.register(fastifyEnv, envConfig());

await server.register(fastifyCORS, { origin: '*' });

await server.register(fastifyKnex, knexConfig(server.config));

await server.register(fastifyRedis, redisConfig(server.config));

await server.register(fastifyFormbody);

await server.register(fastifyMultipart, multipartConfig());

await server.register(fastifyBcrypt, bcryptConfig());

await server.register(fastifyJWT, JWTConfig(server.config));

await server.register(fastifyS3, s3Config(server.config));

await server.register(fastifyMailer, mailerConfig(server.config));

await server.register(fastifySwagger, swaggerConfig());

await server.register(fastifySwaggerUi, swaggerUIConfig());

await server.register(fastifyLogger, loggerConfig());

await server.register(
  fastifyPlugin((instance) => {
    instance.decorateRequest('jwt');
    instance.addHook('onRequest', async (req) => {
      req.jwt = {
        access: { sign: instance.jwt.access.sign },
        refresh: { sign: instance.jwt.refresh.sign },
      };
    });
  })
);

await server.register(
  fastifyPlugin((instance) => {
    instance.decorateRequest('bcrypt');
    instance.addHook('onRequest', async (req) => {
      req.bcrypt = instance.bcrypt;
    });
  })
);

await server.register(
  fastifyPlugin((instance) => {
    instance.decorateRequest('config');
    instance.addHook('onRequest', async (req) => {
      req.config = instance.config;
    });
  })
);

await server.register(
  fastifyPlugin((instance) => {
    instance.decorateRequest('redis');
    instance.addHook('onRequest', async (req) => {
      req.redis = instance.redis;
    });
  })
);

await server.register(routes, { prefix: server.config.WEB_SERVER_BASEPATH });

server.get('/', (req, res) => {
  return res.send({
    statusCode: HTTP_STATUS.OK,
    message: 'server is running',
  });
});

await server.ready();

await server.listen({
  host: server.config.WEB_SERVER_HOST,
  port: server.config.WEB_SERVER_PORT,
});

const host =
  server.config.WEB_SERVER_HOST === '0.0.0.0'
    ? 'localhost'
    : server.config.WEB_SERVER_HOST;

console.log(
  `server is listening at http://${host}:${server.config.WEB_SERVER_PORT}`
);

function gracefulShutdown() {
  server.close(() => {
    server.log.info({ message: `Server is shutting down` });
    process.exit(0);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
