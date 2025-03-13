import controller from './doctor.controller.js';
import schema from './doctor.swagger.js';

const doctorRoutes = (fastify, options, done) => {
  fastify.post(
    '/get-otp/:tenant',
    { schema: schema.getOtp },
    controller.getOtp
  );
  fastify.post('/login', { schema: schema.login }, controller.login);
  // fastify.post(
  //   '/logout',
  //   {
  //     schema: schema.logout,
  //     onRequest: [fastify.authenticateAccess],
  //   },
  //   controller.logout
  // );
  // fastify.get(
  //   '/list',
  //   { schema: schema.list, onRequest: [fastify.authenticateAccess] },
  //   controller.list
  // );
  fastify.post(
    '/create/:tenant',
    { schema: schema.create, onRequest: [fastify.authenticateAccess] },
    controller.create
  );
  fastify.post(
    '/update/:userId',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );
  // fastify.post(
  //   '/delete/:userId',
  //   { schema: schema.delete, onRequest: [fastify.authenticateAccess] },
  //   controller.deleteUser
  // );

  done();
};

export default doctorRoutes;
