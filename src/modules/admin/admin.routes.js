import backOfficeUserRoutes from './back-office-user/back-office-user.routes.js';
import cabinRoutes from './cabins/cabins.routes.js';
import dashboardRoutes from './dashboard/dashboard.routes.js';
import patientRoutes from './employees/employees.routes.js';
import operationCategoryItemsRoutes from './operation-category-items/operation-category-items.routes.js';
import operationCategoryRoutes from './operation-category/operation-category.routes.js';
import operationReportRoutes from './operation-report/operation-report.routes.js';
import settingRoutes from './setting/setting.routes.js';

const adminRoutes = (fastify, options, done) => {
  fastify.register(backOfficeUserRoutes, { prefix: '/back-office-user' });
  fastify.register(dashboardRoutes, { prefix: '/dashboard' });
  fastify.register(patientRoutes, { prefix: '/patient' });
  fastify.register(cabinRoutes, { prefix: '/cabin' });
  fastify.register(settingRoutes, { prefix: '/setting' });
  fastify.register(operationCategoryRoutes, { prefix: '/operation-category' });
  fastify.register(operationCategoryItemsRoutes, {
    prefix: '/operation-category-item',
  });
  fastify.register(operationReportRoutes, { prefix: '/operation-report' });

  done();
};

export default adminRoutes;
