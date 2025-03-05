import controller from './setting.controller.js';
import schema from './setting.swagger.js';

const settingRoutes = (fastify, options, done) => {
  fastify.get(
    '/get',
    { schema: schema.get, onRequest: [fastify.authenticateAccess] },
    controller.get
  );
  fastify.post(
    '/update',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );

  done();
};

export default settingRoutes;
