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

  done();
};

export default scanDiseaseRoutes;
