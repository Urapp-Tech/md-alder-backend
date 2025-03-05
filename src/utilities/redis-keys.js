export function getKeysPattern(id) {
  return `${id}*`;
}

export function getAccessTokenKey(id, token) {
  return `${id}:ACCESS_TOKEN:${token}`;
}

export function getRefreshTokenKey(id, token) {
  return `${id}:REFRESH_TOKEN:${token}`;
}
