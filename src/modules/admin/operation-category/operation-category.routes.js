import controller from './operation-category.controller.js';
import schema from './operation-category.swagger.js';

const operationCategoryRoutes = (fastify, options, done) => {
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
    '/update/:operationCategoryId',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );
  fastify.post(
    '/delete/:operationCategoryId',
    { schema: schema.remove, onRequest: [fastify.authenticateAccess] },
    controller.remove
  );
  fastify.get(
    '/lov',
    { schema: schema.lov, onRequest: [fastify.authenticateAccess] },
    controller.lov
  );
  done();
};

export default operationCategoryRoutes;
