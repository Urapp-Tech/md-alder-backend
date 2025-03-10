import adminRoutes from './modules/admin/admin.routes.js';
import appRoutes from './modules/app/app.routes.js';
import SystemConfigRoutes from './modules/system/system.routes.js';

const routes = (fastify, options, done) => {
  fastify.register(adminRoutes, { prefix: '/admin' });
  fastify.register(appRoutes, { prefix: '/app' });
  fastify.register(SystemConfigRoutes, { prefix: '/system/config' });
  done();
};

export default routes;
