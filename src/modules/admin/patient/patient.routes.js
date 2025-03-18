import controller from './patient.controller.js';
import schema from './patient.swagger.js';

const patientRoutes = (fastify, options, done) => {
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

  // patient visit history services

  fastify.get(
    '/visit/list',
    { schema: schema.listVisit, onRequest: [fastify.authenticateAccess] },
    controller.listVisit
  );

  fastify.post(
    '/visit/create',
    { schema: schema.createVisit, onRequest: [fastify.authenticateAccess] },
    controller.createVisit
  );

  fastify.get(
    '/visit/previous',
    { schema: schema.previousVisit, onRequest: [fastify.authenticateAccess] },
    controller.previousVisit
  );

  done();
};

export default patientRoutes;
