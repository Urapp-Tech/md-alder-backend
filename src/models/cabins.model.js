import { errorHandler } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const list = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const promise = knex
    .select('*')
    .from(`${MODULE.ADMIN.CABIN}`)
    .where({ branch: params.branch, isDeleted: false })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere('cabin_number', 'ilike', `%${params.search || ''}%`);
      }
    })
    .orderBy('created_at', 'desc')
    .offset(params.page * params.size)
    .limit(params.size);

  const countPromise = knex
    .count('* as total')
    .from(`${MODULE.ADMIN.CABIN}`)
    .where({ branch: params.branch, isDeleted: false })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere('cabin_number', 'ilike', `%${params.search || ''}%`);
      }
    });

  const [error, result] = await promiseHandler(promise);
  const [countError, countResult] = await promiseHandler(countPromise);

  if (error || countError) {
    errorHandler(`something went wrong`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  if (!result || !countResult) {
    errorHandler(`No cabin found`, HTTP_STATUS.BAD_REQUEST);
  }

  return {
    list: result,
    total: Number(countResult[0].total),
  };
};

const create = async (req, params) => {
  const body = req.body;

  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex.transaction(async (trx) => {
    try {
      const existingCabin = await trx(MODULE.ADMIN.CABIN)
        .where((builder) => {
          if (body.cabinNumber)
            builder
              .where({ cabinNumber: body.cabinNumber })
              .andWhere({ branch: params.branch })
              .andWhere({ isDeleted: false });
        })
        .first();

      if (existingCabin) {
        errorHandler(
          `The Cabin Number is already registered.`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const [cabin] = await trx(MODULE.ADMIN.CABIN)
        .insert({
          cabinNumber: body.cabinNumber,
          branch: params.branch,
          tenant: params.tenant,
        })
        .returning('*');

      return cabin;
    } catch (error) {
      errorHandler(
        `Error creating employee: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  });
};

const update = async (req, body, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const { cabinNumber } = body;

  const existingCabin = await knex(MODULE.ADMIN.CABIN)
    .where((builder) => {
      if (cabinNumber) {
        builder
          .where({ cabinNumber })
          .andWhere({ branch: params.branch })
          .andWhere({ isDeleted: false });
      }
    })
    .andWhereNot('id', params.cabinId)
    .first();

  if (existingCabin) {
    errorHandler(`This cabin number already exists.`, HTTP_STATUS.BAD_REQUEST);
  }

  const [updatedCabin] = await knex(MODULE.ADMIN.CABIN)
    .update(body)
    .where('id', params.cabinId)
    .returning('*');

  return updatedCabin;
};

const deleteCabin = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  try {
    await knex.transaction(async (trx) => {
      const assignedCount = await trx(MODULE.ADMIN.CABIN_ASSIGN)
        .where('cabin', params.cabinId)
        .andWhere('is_assign', true)
        .count('id as count')
        .first();

      if (assignedCount.count === 0) {
        await trx(MODULE.ADMIN.CABIN)
          .where('id', params.cabinId)
          .update({ isDeleted: true });

        return {
          success: true,
          message: 'Cabin deleted successfully as it was not assigned.',
        };
      }

      await trx(MODULE.ADMIN.CABIN)
        .where('id', params.cabinId)
        .update({ isDeleted: true });

      await trx(MODULE.ADMIN.EMPLOYEE)
        .where('cabin', params.cabinId)
        .update({ cabin: null });

      await trx(MODULE.ADMIN.CABIN_ASSIGN)
        .where('cabin', params.cabinId)
        .update({ isAssign: false });
      return {
        success: true,
        message: 'Cabin deleted and assignments updated successfully.',
      };
    });
  } catch (error) {
    return errorHandler(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const lov = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  try {
    const cabins = await knex
      .select('id', 'cabin_number')
      .from(MODULE.ADMIN.CABIN)
      .where({ branch: params.branch, isDeleted: false, isActive: true })
      .orderBy('cabin_number', 'asc');

    return cabins;
  } catch (error) {
    errorHandler(
      `Error fetching cabin LOV: ${error.message}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

const assign = async (req, params) => {
  const { cabin, employee } = req.body;

  /** @type {import('knex').Knex} */
  const knex = req.knex;

  if (!cabin || !employee) {
    return errorHandler(
      `Cabin ID and Employee ID are required.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
  try {
    let updatedAssignment;
    const existingAssignment = await knex(MODULE.ADMIN.CABIN_ASSIGN)
      .where({ cabin: cabin, employee: employee, isAssign: true })
      .first();

    if (existingAssignment) {
      return errorHandler(
        `This cabin is already assigned to this employee.`,
        HTTP_STATUS.FOUND
      );
    }

    // Begin transaction
    await knex.transaction(async (trx) => {
      const previousAssignment = await trx(MODULE.ADMIN.CABIN_ASSIGN)
        .where({ cabin: cabin, isAssign: true })
        .first();

      await trx(MODULE.ADMIN.CABIN_ASSIGN)
        .where(function () {
          this.where({ cabin: cabin })
            .orWhere({ employee: employee })
            .andWhere({ isAssign: true });
        })
        .update({ isAssign: false, updatedAt: new Date() });

      if (previousAssignment && previousAssignment.employee) {
        await trx(MODULE.ADMIN.EMPLOYEE)
          .where({ id: previousAssignment.employee })
          .update({ cabin: null });
      }

      [updatedAssignment] = await trx(MODULE.ADMIN.CABIN_ASSIGN)
        .insert({
          tenant: params.tenant,
          cabin: cabin,
          employee: employee,
          isAssign: true,
        })
        .returning('*');

      await trx(MODULE.ADMIN.EMPLOYEE)
        .where({ id: employee })
        .update({ cabin: cabin });
    });

    const cabinDetails = await knex(MODULE.ADMIN.CABIN)
      .where({ id: cabin })
      .select('cabin_number')
      .first();

    if (!cabinDetails) {
      return errorHandler(`Cabin details not found.`, HTTP_STATUS.NOT_FOUND);
    }

    return {
      ...updatedAssignment,
      cabinName: cabinDetails.cabinNumber,
    };
  } catch (error) {
    return errorHandler(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const assignCabinScanner = async (req) => {
  const { cabin, identifier, tenant } = req.body;
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  try {
    const assignedEmployee = await knex(MODULE.ADMIN.CABIN_ASSIGN)
      .select('employee')
      .where({ cabin: cabin, isAssign: true })
      .first();

    if (!assignedEmployee) {
      return errorHandler(
        `No employee is currently assigned to this cabin ID: ${cabin}.`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const existingRecord = await knex(MODULE.ADMIN.CABIN_SCANNER)
      .select('details')
      .where({
        cabin: cabin,
        employee: assignedEmployee.employee,
      })
      .andWhereRaw('DATE(created_at) = ?', [currentDate])
      .first();

    const newDetail = {
      time: new Date(),
      identifier,
    };

    if (existingRecord) {
      const updatedDetails = [...existingRecord.details, newDetail];

      const [updatedRecord] = await knex(MODULE.ADMIN.CABIN_SCANNER)
        .where({
          cabin: cabin,
          employee: assignedEmployee.employee,
        })
        .andWhereRaw('DATE(created_at) = ?', [currentDate])
        .update({
          details: JSON.stringify(updatedDetails),
          updatedAt: new Date(), // Update timestamp
        })
        .returning('*');

      return updatedRecord;
    } else {
      const [newRecord] = await knex(MODULE.ADMIN.CABIN_SCANNER)
        .insert({
          cabin: cabin,
          employee: assignedEmployee.employee,
          details: JSON.stringify([newDetail]),
          tenant,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning('*');

      return newRecord;
    }
  } catch (error) {
    return errorHandler(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const addTimes = (time1, time2) => {
  const totalSeconds =
    time1.hours * 3600 +
    time1.minutes * 60 +
    time1.seconds +
    (time2.hours * 3600 + time2.minutes * 60 + time2.seconds);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
};

const formatTime = (timeObj) => {
  const totalSeconds =
    timeObj.hours * 3600 + timeObj.minutes * 60 + timeObj.seconds;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours} hours ${minutes} minutes ${seconds} seconds`;
};

const calculateTimeDifference = (startTime, endTime) => {
  if (!startTime || !endTime) return { hours: 0, minutes: 0, seconds: 0 };

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const diffInMs = end - start;
  const hours = Math.floor(diffInMs / 3600000);
  const minutes = Math.floor((diffInMs % 3600000) / 60000);
  const seconds = Math.floor((diffInMs % 60000) / 1000);

  return { hours, minutes, seconds };
};

const processDetails = (details) => {
  let totalPresentTime = { hours: 0, minutes: 0, seconds: 0 };
  let totalAbsentTime = { hours: 0, minutes: 0, seconds: 0 };

  for (let i = 1; i < details.length; i++) {
    const currentRecord = details[i];
    const previousRecord = details[i - 1];

    // if (currentRecord.identifier === previousRecord.identifier) {
    const timeDifference = calculateTimeDifference(
      previousRecord.time,
      currentRecord.time
    );

    if (previousRecord.identifier === true) {
      // Add to presence time if the previous record was "present"
      totalPresentTime = addTimes(totalPresentTime, timeDifference);
    } else {
      // Add to absence time if the previous record was "absent"
      totalAbsentTime = addTimes(totalAbsentTime, timeDifference);
    }
    // }
  }

  return {
    totalPresentTime,
    totalAbsentTime,
  };
};

const employeehistory = async (req, params) => {
  const { knex } = req;
  const { cabin, startDate, endDate, employee, page, size } = params;

  try {
    if (!cabin || !startDate || !endDate || !employee) {
      return errorHandler(
        'cabinId, startDate, endDate, and employee are required query parameters.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const cabinCondition = cabin === 'ALL' ? { employee } : { cabin, employee };

    // Fetch data
    const dataQuery = knex(MODULE.ADMIN.CABIN_SCANNER)
      .select(['employee', 'cabin', 'created_at as date', 'details'])
      .where(cabinCondition)
      .andWhereRaw('DATE(created_at) BETWEEN ? AND ?', [startDate, endDate])
      .orderBy('created_at', 'asc');
    // .limit(size)
    // .offset(page * size);

    const countQuery = knex(MODULE.ADMIN.CABIN_SCANNER)
      .where(cabinCondition)
      .andWhereRaw('DATE(created_at) BETWEEN ? AND ?', [startDate, endDate])
      .count({ total: 'id' })
      .first();

    const [list, _total] = await Promise.all([dataQuery, countQuery]);

    // console.log('list', list);

    const processedData = list.reduce(
      (accumulator, record) => {
        const { totalPresentTime, totalAbsentTime } = processDetails(
          record.details
        );

        const updatedDetails = record.details.map((detail) => ({
          ...detail,
          cabin: record.cabin,
        }));

        accumulator.details.push(...updatedDetails);
        accumulator.totalPresentTime = addTimes(
          accumulator.totalPresentTime,
          totalPresentTime
        );
        accumulator.totalAbsentTime = addTimes(
          accumulator.totalAbsentTime,
          totalAbsentTime
        );

        return accumulator;
      },
      {
        details: [],
        totalPresentTime: { hours: 0, minutes: 0, seconds: 0 },
        totalAbsentTime: { hours: 0, minutes: 0, seconds: 0 },
      }
    );

    const paginatedDetails = processedData.details.slice(
      page * size,
      (page + 1) * size
    );

    return {
      data: {
        details: paginatedDetails,
        totalPresentTime: formatTime(processedData.totalPresentTime),
        totalAbsentTime: formatTime(processedData.totalAbsentTime),
      },
      // total: total.total,
      total: processedData.details.length,
      // totalDetailsPages: Math.ceil(processedData.details.length / size),
    };
  } catch (error) {
    return errorHandler(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

const cabinHistory = async (req, params) => {
  const { knex } = req;
  const { cabin, startDate, endDate, employee, page, size } = params;

  try {
    if (!cabin || !startDate || !endDate || !employee) {
      return errorHandler(
        'cabinId, startDate, endDate, and employee are required query parameters.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return errorHandler(
        'Start date cannot be greater than end date.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const cabinCondition = employee === 'ALL' ? { cabin } : { cabin, employee };

    const dataQuery = knex
      .select([
        'ca.*',
        knex.raw(
          `
         CASE 
            WHEN ca.is_assign = true THEN NULL
            ELSE COALESCE(
              LEAD(ca.created_at) OVER (
                PARTITION BY ca.cabin
                ORDER BY ca.created_at ASC
              ),
              ca.updated_at
            )
          END AS end_time
          `
        ),
      ])
      .from(`${MODULE.ADMIN.CABIN_ASSIGN} as ca`)
      .where(cabinCondition)
      .andWhereRaw('DATE(ca.created_at) BETWEEN ? AND ?', [startDate, endDate])
      .orderBy('ca.created_at', 'asc')
      .limit(size)
      .offset(page * size);

    const countQuery = knex(MODULE.ADMIN.CABIN_ASSIGN)
      .where(cabinCondition)
      .andWhereRaw('DATE(created_at) BETWEEN ? AND ?', [startDate, endDate])
      .count({ total: 'id' })
      .first();

    const [list, total] = await Promise.all([dataQuery, countQuery]);

    return {
      list: list.map((record) => ({
        ...record,
      })),
      total: Number(total.total),
    };
    // return {
    //   list,
    //   total: Number(total.total),
    // };
  } catch (error) {
    return errorHandler(error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export default {
  list,
  create,
  update,
  deleteCabin,
  lov,
  assign,
  assignCabinScanner,
  employeehistory,
  cabinHistory,
};
