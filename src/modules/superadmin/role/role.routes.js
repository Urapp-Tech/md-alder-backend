import controller from './role.controller.js';
import schema from './role.swagger.js';

const roleRoutes = (fastify, options, done) => {
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
  // fastify.get(
  //   '/edit/:id',
  //   { schema: schema.edit, onRequest: [fastify.authenticateAccess] },
  //   controller.edit
  // );
  fastify.post(
    '/update/:roleId',
    { schema: schema.update, onRequest: [fastify.authenticateAccess] },
    controller.update
  );
  fastify.post(
    '/update/status/:id',
    { schema: schema.updateStatus, onRequest: [fastify.authenticateAccess] },
    controller.updateStatus
  );
  fastify.get(
    '/permissions',
    { schema: schema.getPermissions, onRequest: [fastify.authenticateAccess] },
    controller.permissions
  );
  fastify.get(
    '/permission/:roleId',
    { schema: schema.permission, onRequest: [fastify.authenticateAccess] },
    controller.getPermissionsById
  );
  fastify.get(
    '/lov',
    { schema: schema.lov, onRequest: [fastify.authenticateAccess] },
    controller.lov
  );

  done();
};

export default roleRoutes;
