import { parse } from '@lukeed/ms';
import getSha256Hash from './hash.js';
import createRedisFunctions from './redis-helpers.js';
import { getAccessTokenKey, getRefreshTokenKey } from './redis-keys.js';

async function generateUserTokens(req, payload) {
  const { id, tenant, branch } = payload;
  const accessToken = req.jwt.access.sign({
    id,
    tenant,
    branch,
  });

  const refreshToken = req.jwt.refresh.sign({
    id,
    tenant,
    branch,
  });

  const accessTokenHash = getSha256Hash(accessToken);

  const { set } = createRedisFunctions(req.redis);

  const accessTokenKey = getAccessTokenKey(id, accessTokenHash);
  const refreshTokenKey = getRefreshTokenKey(id, accessTokenHash);

  const accessTokenExpiryInSeconds =
    parse(req.config.ACCESS_JWT_EXPIRES_IN) / 1000;
  const refreshTokenExpiryInSeconds =
    parse(req.config.REFRESH_JWT_EXPIRES_IN) / 1000;

  await set(accessTokenKey, accessToken, accessTokenExpiryInSeconds);
  await set(refreshTokenKey, refreshToken, refreshTokenExpiryInSeconds);

  return {
    token: `${id}:${accessTokenHash}`,
  };
}

export default generateUserTokens;
