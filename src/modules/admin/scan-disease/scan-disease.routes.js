import controller from './scan-disease.controller.js';
import schema from './scan-disease.swagger.js';

const scanDiseaseRoutes = (fastify, options, done) => {
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
    '/update/:id',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );
  fastify.post(
    '/delete/:id',
    { schema: schema.delete, onRequest: [fastify.authenticateAccess] },
    controller.deleteField
  );
  fastify.get(
    '/lov',
    { schema: schema.lov, onRequest: [fastify.authenticateAccess] },
    controller.lov
  );

  done();
};

export default scanDiseaseRoutes;
