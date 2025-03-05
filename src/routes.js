import adminRoutes from './modules/admin/admin.routes.js';
import SystemConfigRoutes from './modules/system/system.routes.js';

const routes = (fastify, options, done) => {
  fastify.register(adminRoutes, { prefix: '/admin' });
  fastify.register(SystemConfigRoutes, { prefix: '/system/config' });
  done();
};

export default routes;
