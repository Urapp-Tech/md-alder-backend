import controller from './cabins.controller.js';
import schema from './cabins.swagger.js';

const cabinRoutes = (fastify, options, done) => {
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
    '/update/:cabinId',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );
  fastify.post(
    '/delete/:cabinId',
    { schema: schema.delete, onRequest: [fastify.authenticateAccess] },
    controller.deleteCabin
  );
  fastify.get(
    '/lov',
    { schema: schema.lov, onRequest: [fastify.authenticateAccess] },
    controller.lov
  );
  fastify.post(
    '/assign',
    { schema: schema.assign, onRequest: [fastify.authenticateAccess] },
    controller.assign
  );
  fastify.post(
    '/scanner',
    { schema: schema.scanner, onRequest: [fastify.authenticateAccess] },
    controller.scanner
  );
  fastify.get(
    '/history',
    { schema: schema.history, onRequest: [fastify.authenticateAccess] },
    controller.history
  );
  fastify.get(
    '/cabin-history',
    { schema: schema.cabinHistory, onRequest: [fastify.authenticateAccess] },
    controller.cabinHistory
  );

  done();
};

export default cabinRoutes;
