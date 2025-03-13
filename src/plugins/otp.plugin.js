import fastifyPlugin from 'fastify-plugin';
import { HOUR_IN_MS, HOUR } from '#utilities/time-constants';
import createRedisFunctions from '#utilities/redis-helpers';

const OPT_KEY = (key) => `OTP:${key}`;

async function fastifyOtp(fastify) {
  const { get, set, del } = createRedisFunctions(fastify.redis);
  const { hash, compare } = fastify.bcrypt;
  await fastify.addHook('onRequest', async function (request) {
    const otp = {
      async get(email) {
        const OTP = Math.floor(1000 + Math.random() * 9000).toString();
        const object = {
          hashedOTP: await hash(OTP),
          expiresAt: Date.now() + HOUR_IN_MS,
        };
        await set(OPT_KEY(email), object, HOUR);
        return OTP;
      },
      async verify(email, otp) {
        const OTP = await get(OPT_KEY(email));
        if (!OTP || OTP.expiresAt < Date.now()) {
          return false;
        }
        return compare(otp, OTP.hashedOTP);
      },
      async remove(email) {
        await del(OPT_KEY(email));
      },
    };
    request.otp = otp;
  });
}

export default fastifyPlugin(fastifyOtp);
