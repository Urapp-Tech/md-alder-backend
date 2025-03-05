import HTTP_STATUS from '#utilities/http-status';
import createRedisFunctions from '#utilities/redis-helpers';
import { getAccessTokenKey, getRefreshTokenKey } from '#utilities/redis-keys';
import fastifyJWT from '@fastify/jwt';
import fastifyPlugin from 'fastify-plugin';

function noTokenInHeaderError() {
  const error = new Error(`No Authorization was found in request.headers`);
  error.statusCode = HTTP_STATUS.UNAUTHORIZED;
  error.code = `FST_JWT_NO_AUTHORIZATION_IN_HEADER`;
  error.error = `Unauthorized`;
  throw error;
}
function tokenExpiredError() {
  const error = new Error(`Authorization token expired`);
  error.statusCode = HTTP_STATUS.UNAUTHORIZED;
  error.code = `FST_JWT_AUTHORIZATION_TOKEN_EXPIRED`;
  error.error = `Unauthorized`;
  throw error;
}
function tokenInvalidError() {
  const error = new Error(
    `Authorization token is invalid. format is Bearer 01234567-89ab-4cde-8f01-23456789abcd:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef`
  );
  error.statusCode = HTTP_STATUS.UNAUTHORIZED;
  error.code = `FST_JWT_AUTHORIZATION_TOKEN_INVALID`;
  error.error = `Unauthorized`;
  throw error;
}

const TOKEN_PATTERN =
  /^([0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[4][0-9A-Fa-f]{3}-[89AaBb][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}):([A-Fa-f0-9]{64})$/;

async function myFastifyJWT(fastify, opts) {
  await fastify.register(fastifyJWT, opts.access);
  await fastify.register(fastifyJWT, opts.refresh);

  const { get, del } = createRedisFunctions(fastify.redis);

  fastify.decorate('authenticateAccess', async function (request, reply) {
    try {
      if (!request.headers.authorization) {
        noTokenInHeaderError();
      }
      const regExpExecArray = TOKEN_PATTERN.exec(
        request.headers.authorization.replace('Bearer ', '')
      );
      if (!regExpExecArray) {
        tokenInvalidError();
      }
      const [, id, tokenHash] = regExpExecArray;
      request.headers.tokenHash = tokenHash;
      const key = getAccessTokenKey(id, tokenHash);
      const token = await get(key);
      if (!token) {
        tokenExpiredError();
      }
      request.headers.authorization = `Bearer ${token}`;
      await request.accessJwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
  fastify.decorate('authenticateRefresh', async function (request, reply) {
    try {
      if (!request.headers.authorization) {
        noTokenInHeaderError();
      }

      const regExpExecArray = TOKEN_PATTERN.exec(
        request.headers.authorization.replace('Bearer ', '')
      );
      if (!regExpExecArray) {
        tokenInvalidError();
      }
      const [, id, tokenHash] = regExpExecArray;
      request.headers.tokenHash = tokenHash;
      const key = getRefreshTokenKey(id, tokenHash);
      const token = await get(key);
      if (!token) {
        tokenExpiredError();
      }
      await del(key);
      request.headers.authorization = `Bearer ${token}`;
      await request.refreshJwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
}

export default fastifyPlugin(myFastifyJWT);
