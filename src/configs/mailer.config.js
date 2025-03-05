function mailerConfig(config) {
  return {
    apiKey: config.SENDGRID_API_KEY,
    from: config.SENDGRID_MAIL_FROM,
  };
}

export default mailerConfig;
