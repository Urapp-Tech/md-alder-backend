import backOfficeUserRoutes from './back-office-user/back-office-user.routes.js';
import cabinRoutes from './cabins/cabins.routes.js';
import dashboardRoutes from './dashboard/dashboard.routes.js';
import patientRoutes from './patient/patient.routes.js';
import operationCategoryItemsRoutes from './operation-category-items/operation-category-items.routes.js';
import operationCategoryRoutes from './operation-category/operation-category.routes.js';
import operationReportRoutes from './operation-report/operation-report.routes.js';
import settingRoutes from './setting/setting.routes.js';
import formFieldsRoutes from './form-fields/form-field.routes.js';
import scanDiseaseRoutes from './scan-disease/scan-disease.routes.js';

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
  fastify.register(formFieldsRoutes, { prefix: '/form-field' });
  fastify.register(scanDiseaseRoutes, { prefix: '/scan-disease' });

  done();
};

export default adminRoutes;
