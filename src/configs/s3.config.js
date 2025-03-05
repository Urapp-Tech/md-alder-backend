function s3Config(config) {
  return {
    region: config.region || process.env.S3_REGION,
    credentials: {
      accessKeyId: config.accessKeyId || process.env.S3_ACCESS_ID,
      secretAccessKey: config.secretAccessKey || process.env.S3_ACCESS_KEY,
    },
  };
}

export default s3Config;
