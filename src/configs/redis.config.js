function redisConfig(config) {
  return {
    host: config.REDIS_CLIENT_HOST,
    port: config.REDIS_CLIENT_PORT,
  };
}

export default redisConfig;
