import controller from './employees.controller.js';
import schema from './employees.swagger.js';

const employeeRoutes = (fastify, options, done) => {
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
    '/update/:empId',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );
  fastify.post(
    '/delete/:empId',
    { schema: schema.delete, onRequest: [fastify.authenticateAccess] },
    controller.deleteEmp
  );
  fastify.get(
    '/lov',
    { schema: schema.lov, onRequest: [fastify.authenticateAccess] },
    controller.lov
  );

  done();
};

export default employeeRoutes;
