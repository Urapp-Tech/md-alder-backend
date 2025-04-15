import controller from './back-office-user.controller.js';
import schema from './back-office-user.swagger.js';

const backOfficeUserRoutes = (fastify, options, done) => {
  fastify.post('/login', { schema: schema.login }, controller.login);
  fastify.get(
    '/list',
    { schema: schema.list, onRequest: [fastify.authenticateAccess] },
    controller.list
  );
  fastify.post(
    '/create',
    { schema: schema.docCreate, onRequest: [fastify.authenticateAccess] },
    controller.create
  );

  done();
};

export default backOfficeUserRoutes;
