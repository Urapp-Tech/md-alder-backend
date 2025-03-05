import controller from './operation-report.controller.js';
import schema from './operation-report.swagger.js';

const operationReportRoutes = (fastify, options, done) => {
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
  // fastify.post(
  //   '/update/:operationCategoryId',
  //   { schema: schema.update, onRequest: [fastify.authenticateAccess] },
  //   controller.update
  // );
  // fastify.post(
  //   '/delete/:operationCategoryId',
  //   { schema: schema.remove, onRequest: [fastify.authenticateAccess] },
  //   controller.remove
  // );
  done();
};

export default operationReportRoutes;
