import { errorHandler } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const activity = async (req, params) => {
  const { branch, tenant } = params;

  /** @type {import('knex').Knex} */
  const knex = req.knex;

  // const patientCountPromise = knex
  //   .count('* as total')
  //   .from(`${MODULE.ADMIN.PATIENT}`)
  //   .where({
  //     tenant,
  //     // branch,
  //     isActive: true,
  //     isDeleted: false,
  //   });

  const doctorCountPromise = knex
    .count('* as total')
    .from(`${MODULE.ADMIN.DOCTOR}`)
    .where({
      tenant,
      // branch,
      isActive: true,
      isDeleted: false,
    });

  const patientCountPromise = knex
    .from(`${MODULE.ADMIN.PATIENT} as p`)
    .leftJoin(
      `${MODULE.ADMIN.PATIENT_TENANT_BRANCH} as ptb`,
      'p.id',
      '=',
      'ptb.patient'
    )
    .where({
      'p.tenant': tenant,
      'p.is_deleted': false,
      'p.is_active': true,
    })
    .andWhere((qb) => {
      if (branch) {
        qb.andWhere('ptb.branch', branch);
      }
    })
    .select([
      knex.raw('COUNT(*) as totalPatients'),
      knex.raw(
        `COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last7DaysPatients`
      ),
    ]);

  const [
    // [cabinCountError, cabinCountResult],
    [doctorCountError, doctorCountResult],
    [patientCountError, patientCountResult],
  ] = await Promise.all([
    // promiseHandler(cabinCountPromise),
    promiseHandler(doctorCountPromise),
    promiseHandler(patientCountPromise),
  ]);

  if (
    // cabinCountError ||
    doctorCountError ||
    patientCountError
  ) {
    errorHandler(`Something went wrong`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // console.log('ss', patientCountResult);

  return {
    // totalActiveCabins: Number(cabinCountResult[0]?.total || 0),
    totalDoctors: Number(doctorCountResult[0]?.total || 0),
    patients: {
      total: Number(patientCountResult[0]?.totalpatients || 0),
      last7DaysPatients: Number(patientCountResult[0]?.last7Dayspatients || 0),
    },
  };
};

export default {
  activity,
};
