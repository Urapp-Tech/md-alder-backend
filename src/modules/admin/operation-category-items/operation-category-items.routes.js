import controller from './operation-category-items.controller.js';
import schema from './operation-category-items.swagger.js';

const operationCategoryItemsRoutes = (fastify, options, done) => {
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
    '/update/:operationCategoryItemId',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );
  fastify.post(
    '/delete/:operationCategoryItemId',
    { schema: schema.remove, onRequest: [fastify.authenticateAccess] },
    controller.remove
  );
  done();
};

export default operationCategoryItemsRoutes;
