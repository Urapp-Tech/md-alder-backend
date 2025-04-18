import controller from './permission.controller.js';
import schema from './permission.swagger.js';

const permissionRoutes = (fastify, options, done) => {
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
  fastify.get(
    '/edit/:id',
    { schema: schema.edit, onRequest: [fastify.authenticateAccess] },
    controller.edit
  );
  fastify.get(
    '/child/list/:pid',
    { schema: schema.childList, onRequest: [fastify.authenticateAccess] },
    controller.childList
  );
  fastify.post(
    '/update/:pid',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );
  fastify.post(
    '/update/status/:id',
    { schema: schema.updateStatus, onRequest: [fastify.authenticateAccess] },
    controller.updateStatus
  );
  fastify.post(
    '/child/update/status/:id',
    { schema: schema.updateStatus, onRequest: [fastify.authenticateAccess] },
    controller.updateStatus
  );

  done();
};

export default permissionRoutes;
