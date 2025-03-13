import doctorRoutes from './doctor/doctor.routes.js';

const appRoutes = (fastify, options, done) => {
  fastify.register(doctorRoutes, { prefix: '/doctor' });

  done();
};

export default appRoutes;
