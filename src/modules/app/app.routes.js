import userRoutes from './user/user.routes.js';

const appRoutes = (fastify, options, done) => {
  fastify.register(userRoutes, { prefix: '/user' });

  done();
};

export default appRoutes;
