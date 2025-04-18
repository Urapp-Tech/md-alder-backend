import backOfficeUserRoutes from './back-office-user/back-office-user.routes.js';
import permissionRoutes from './permission/permission.routes.js';
import roleRoutes from './role/role.routes.js';

const superAdminRoutes = (fastify, options, done) => {
  fastify.register(backOfficeUserRoutes, { prefix: '/back-office-user' });
  fastify.register(permissionRoutes, { prefix: '/permission' });
  fastify.register(roleRoutes, { prefix: '/role' });

  done();
};

export default superAdminRoutes;
