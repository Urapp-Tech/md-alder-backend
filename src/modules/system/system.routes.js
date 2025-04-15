import controller from './system.controller.js';
import schema from './system.swagger.js';

const SystemConfigRoutes = (fastify, options, done) => {
  fastify.get('/get/:domain', { schema: schema.get }, controller.get);
  fastify.get(
    '/get/default/theme',
    { schema: schema.defaultTheme },
    controller.defaultTheme
  );

  done();
};

export default SystemConfigRoutes;
