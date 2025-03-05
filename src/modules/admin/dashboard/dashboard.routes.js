import controller from './dashboard.controller.js';
import schema from './dashboard.swagger.js';

const dashboardRoutes = (fastify, options, done) => {
  fastify.get(
    '/activity',
    {
      schema: schema.activity,
      onRequest: [fastify.authenticateAccess],
    },
    controller.activity
  );

  done();
};

export default dashboardRoutes;
