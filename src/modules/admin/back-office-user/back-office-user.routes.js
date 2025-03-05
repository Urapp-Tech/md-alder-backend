import controller from './back-office-user.controller.js';
import schema from './back-office-user.swagger.js';

const backOfficeUserRoutes = (fastify, options, done) => {
  fastify.post('/login', { schema: schema.login }, controller.login);
  fastify.post(
    '/logout',
    {
      schema: schema.logout,
      onRequest: [fastify.authenticateAccess],
    },
    controller.logout
  );
  fastify.get(
    '/list',
    { schema: schema.list, onRequest: [fastify.authenticateAccess] },
    controller.list
  );
  fastify.post(
    '/create',
    { schema: schema.create, onRequest: [fastify.authenticateAccess] },
    controller.create
  );
  fastify.post(
    '/update/:userId',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );
  fastify.post(
    '/delete/:userId',
    { schema: schema.delete, onRequest: [fastify.authenticateAccess] },
    controller.deleteUser
  );

  done();
};

export default backOfficeUserRoutes;
