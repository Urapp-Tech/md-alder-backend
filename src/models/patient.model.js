import { errorHandler } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const list = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const {
    tenant,
    id,
    search,
    page = 0,
    size = 10,
    startDate,
    endDate,
  } = params;

  const baseQuery = knex
    .select('patient.*')
    .from(`${MODULE.PATIENT_MODULE.PATIENT} as patient`)
    .leftJoin(
      `${MODULE.BACK_OFFICE.USER} as bou`,
      'patient.back_office_user',
      'bou.id'
    )
    .where({
      'patient.tenant': tenant,
      'patient.is_deleted': false,
      'patient.is_active': true,
    });

  if (id) {
    baseQuery.andWhere('bou.id', id);
  }

  if (search) {
    baseQuery.andWhere((qb) => {
      qb.where('patient.name', 'ilike', `%${search}%`).orWhere(
        'patient.email',
        'ilike',
        `%${search}%`
      );
    });
  }

  if (startDate && endDate) {
    baseQuery.andWhereBetween('patient.created_at', [startDate, endDate]);
  }

  baseQuery
    .orderBy('patient.created_at', 'desc')
    .offset(page * size)
    .limit(size);

  // Count query
  const countQuery = knex
    .count('* as total')
    .from(`${MODULE.PATIENT_MODULE.PATIENT} as patient`)
    .leftJoin(
      `${MODULE.BACK_OFFICE.USER} as bou`,
      'patient.back_office_user',
      'bou.id'
    )
    .where({
      'patient.tenant': tenant,
      'patient.is_deleted': false,
      'patient.is_active': true,
    });

  if (id) {
    countQuery.andWhere('bou.id', id);
  }

  if (search) {
    countQuery.andWhere((qb) => {
      qb.where('patient.name', 'ilike', `%${search}%`).orWhere(
        'patient.email',
        'ilike',
        `%${search}%`
      );
    });
  }

  if (startDate && endDate) {
    countQuery.andWhereBetween('patient.created_at', [startDate, endDate]);
  }

  const [error, result] = await promiseHandler(baseQuery);
  const [countError, countResult] = await promiseHandler(countQuery);

  if (error || countError) {
    const newError = new Error(`Something went wrong`);
    newError.code = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw newError;
  }

  if (!result || !countResult) {
    const newError = new Error(`No patient found`);
    newError.code = HTTP_STATUS.BAD_REQUEST;
    throw newError;
  }

  return {
    list: result,
    total: Number(countResult[0].total),
  };
};

const create = async (req, body, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  // console.log('params -->', params);
  // return;

  return knex.transaction(async (trx) => {
    try {
      const existingPatient = await trx(MODULE.PATIENT_MODULE.PATIENT)
        .leftJoin(
          MODULE.PATIENT_MODULE.TENANT_BRANCH,
          'patient.id',
          'patient_tenant_branch.patient'
        )
        .where((builder) => {
          if (body.email) builder.orWhere({ 'patient.email': body.email });
          if (body.phone) builder.orWhere({ 'patient.phone': body.phone });
        })
        .andWhere({
          'patient.is_deleted': false,
          'patient_tenant_branch.branch': params.branch,
        })
        .first();

      if (existingPatient) {
        const errorMessage = `The Email/Phone is already registered to another patient.`;
        errorHandler(errorMessage, HTTP_STATUS.BAD_REQUEST);
      }

      const branchRecord = await trx(MODULE.BRANCH)
        .where({ id: params.branch })
        .first();

      if (!branchRecord) {
        errorHandler(`No branch found`, HTTP_STATUS.BAD_REQUEST);
      }

      const branchType = branchRecord.branchType === 'MAIN' ? 'MAIN' : 'OTHER';

      const [patient] = await trx(MODULE.PATIENT_MODULE.PATIENT)
        .insert({
          name: body.name,
          email: body.email || null,
          age: body.age,
          gender: body.gender,
          phone: body.phone || null,
          address: body.address,
          occupation: body.occupation,
          avatar: body.avatar,
          tenant: params.tenant,
          backOfficeUser: params.id,
        })
        .returning('*');

      await trx(MODULE.PATIENT_MODULE.TENANT_BRANCH).insert({
        tenant: params.tenant,
        branch: params.branch,
        patient: patient.id,
        type: branchType,
      });

      return patient;
    } catch (error) {
      errorHandler(
        `Error creating employee: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  });
};

const update = async (req, body, params) => {
  const { _email, _phone } = body;

  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const existingPatient = await knex(MODULE.PATIENT_MODULE.PATIENT)
    .leftJoin(
      MODULE.PATIENT_MODULE.TENANT_BRANCH,
      'employee.id',
      'employee_tenant_branch.employee'
    )
    .where((builder) => {
      if (body.email) builder.orWhere({ 'employee.email': body.email });
      if (body.phone) builder.orWhere({ 'employee.phone': body.phone });
      if (body.cardNumber)
        builder.orWhere({ 'employee.card_number': body.cardNumber });
    })
    .andWhere({
      'employee.is_deleted': false,
      'employee_tenant_branch.branch': params.branch,
    })
    .andWhereNot('employee.id', params.empId)
    .first();

  if (existingPatient) {
    errorHandler(
      `An employee with the email/phone/card-number already exists.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const [updatedEmployee] = await knex(MODULE.ADMIN.EMPLOYEE)
    .update(body)
    .where('id', params.empId)
    .returning('*');

  return updatedEmployee;
};

const deleteEmp = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex(MODULE.PATIENT_MODULE.PATIENT)
    .where('id', params.empId)
    .update({ isDeleted: true });
};

const lov = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  try {
    const employees = await knex
      .select('employee.id', 'employee.name')
      .from(`${MODULE.PATIENT_MODULE.PATIENT} as employee`)
      .leftJoin(
        `${MODULE.PATIENT_MODULE.TENANT_BRANCH} as etb`,
        'employee.id',
        'etb.employee'
      )
      .where({
        'employee.tenant': params.tenant,
        'employee.is_deleted': false,
      })
      .andWhere((qb) => {
        if (params.branch) {
          qb.andWhere('etb.branch', params.branch);
        }
      })
      .orderBy('employee.name', 'asc');

    return employees;
  } catch (error) {
    errorHandler(
      `Error fetching employee LOV: ${error.message}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

const listVisit = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const promise = knex
    .select('*')
    .from(`${MODULE.PATIENT_MODULE.VISIT_HISTORY}`)
    .where({
      tenant: params.tenant,
      patient: params.patient,
      isDeleted: false,
    })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere(
          'chief_complaint',
          'ilike',
          `%${params.search || ''}%`
        ).orWhere('medical_note', 'ilike', `%${params.search || ''}%`);
      }
    })
    .orderBy('created_at', 'desc')
    .offset(params.page * params.size)
    .limit(params.size);

  const countPromise = knex
    .count('* as total')
    .from(`${MODULE.PATIENT_MODULE.VISIT_HISTORY}`)
    .where({
      tenant: params.tenant,
      patient: params.patient,
      isDeleted: false,
    })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere(
          'chief_complaint',
          'ilike',
          `%${params.search || ''}%`
        ).orWhere('medical_note', 'ilike', `%${params.search || ''}%`);
      }
    });

  const [error, result] = await promiseHandler(promise);
  const [countError, countResult] = await promiseHandler(countPromise);

  if (error || countError) {
    const newError = new Error(`something went wrong`);
    newError.detail = `something went wrong`;
    newError.code = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw newError;
  }

  if (!result || !countResult) {
    const newError = new Error(`No employee found`);
    newError.detail = `No employee found`;
    newError.code = HTTP_STATUS.BAD_REQUEST;
    throw newError;
  }

  return {
    list: result,
    total: Number(countResult[0].total),
  };
};

const createVisit = async (req, body) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;
  try {
    const [patientVisit] = await knex(MODULE.PATIENT_MODULE.VISIT_HISTORY)
      .insert(body)
      .returning('*');

    return patientVisit;
  } catch (error) {
    errorHandler(
      `Error creating employee: ${error.message}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
};

const previousVisit = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const promise = knex
    .select('*')
    .from(`${MODULE.PATIENT_MODULE.VISIT_HISTORY}`)
    .where({
      tenant: params.tenant,
      patient: params.patient,
      isDeleted: false,
    })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere(
          'chief_complaint',
          'ilike',
          `%${params.search || ''}%`
        ).orWhere('medical_note', 'ilike', `%${params.search || ''}%`);
      }
    })
    .orderBy('created_at', 'desc')
    .offset(params.page * params.size)
    .limit(params.size);

  const countPromise = knex
    .count('* as total')
    .from(`${MODULE.PATIENT_MODULE.VISIT_HISTORY}`)
    .where({
      tenant: params.tenant,
      patient: params.patient,
      isDeleted: false,
    })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere(
          'chief_complaint',
          'ilike',
          `%${params.search || ''}%`
        ).orWhere('medical_note', 'ilike', `%${params.search || ''}%`);
      }
    });

  const [error, result] = await promiseHandler(promise);
  const [countError, countResult] = await promiseHandler(countPromise);

  if (error || countError) {
    const newError = new Error(`something went wrong`);
    newError.detail = `something went wrong`;
    newError.code = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw newError;
  }

  if (!result || !countResult) {
    const newError = new Error(`No employee found`);
    newError.detail = `No employee found`;
    newError.code = HTTP_STATUS.BAD_REQUEST;
    throw newError;
  }

  return {
    list: result,
    total: Number(countResult[0].total),
  };
};

export default {
  list,
  create,
  update,
  deleteEmp,
  lov,
  listVisit,
  createVisit,
  previousVisit,
};
