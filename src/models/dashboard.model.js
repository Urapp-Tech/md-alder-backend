import { errorHandler } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const activity = async (req, params) => {
  const { tenant, id } = params;

  console.log('params', id);

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

  // const doctorCountPromise = knex
  //   .count('* as total')
  //   .from(`${MODULE.DOCTOR}`)
  //   .where({
  //     tenant,
  //     // branch,
  //     isActive: true,
  //     isDeleted: false,
  //   });

  const allPatientsPromise = knex(`${MODULE.PATIENT_MODULE.PATIENT} as p`)
    .leftJoin(
      `${MODULE.BACK_OFFICE.USER} as bou`,
      'p.back_office_user',
      'bou.id'
    )
    .select('p.*')
    .where({
      'p.tenant': tenant,
      'p.is_deleted': false,
    })
    .andWhere((qb) => {
      if (id) qb.andWhere('bou.id', id);
    })
    .orderBy('p.created_at', 'desc')
    .limit(4);

  const patientCountPromise = knex
    .from(`${MODULE.PATIENT_MODULE.PATIENT} as p`)
    .leftJoin(
      `${MODULE.BACK_OFFICE.USER} as bou`,
      'p.back_office_user',
      '=',
      'bou.id'
    )
    .where({
      'p.tenant': tenant,
      'p.is_deleted': false,
      'p.is_active': true,
    })
    .andWhere((qb) => {
      if (id) {
        qb.andWhere('bou.id', id);
      }
    })
    .select([
      knex.raw('COUNT(*) as totalPatients'),
      knex.raw(
        `COUNT(CASE WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last7DaysPatients`
      ),
    ]);

  const genderStatsPromise = knex(`${MODULE.PATIENT_MODULE.PATIENT} as p`)
    .leftJoin(
      `${MODULE.BACK_OFFICE.USER} as bou`,
      'p.back_office_user',
      'bou.id'
    )
    .select([
      knex.raw("TO_CHAR(p.created_at, 'Mon') AS month"),
      'p.gender',
      knex.raw('COUNT(*) AS total'),
    ])
    .where({
      'p.tenant': tenant,
      'p.is_deleted': false,
      'p.is_active': true,
    })
    .andWhere((qb) => {
      if (id) qb.andWhere('bou.id', id);
    })
    .groupByRaw('month, p.gender')
    .orderByRaw('MIN(p.created_at)');

  const [
    [patientCountError, patientCountResult],
    [allPatientsError, allPatientsResult],
    [genderStatsError, genderStatsResult],
  ] = await Promise.all([
    promiseHandler(patientCountPromise),
    promiseHandler(allPatientsPromise),
    promiseHandler(genderStatsPromise),
  ]);

  if (genderStatsError || allPatientsError || patientCountError) {
    errorHandler(`Something went wrong`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // console.log('ss', patientCountResult);

  return {
    // totalActiveCabins: Number(cabinCountResult[0]?.total || 0),
    // totalDoctors: Number(doctorCountResult[0]?.total || 0),
    patients: {
      total: Number(patientCountResult[0]?.totalpatients || 0),
      last7DaysPatients: Number(patientCountResult[0]?.last7Dayspatients || 0),
    },
    allPatients: allPatientsResult,
    genderStats: genderStatsResult,
  };
};

export default {
  activity,
};
