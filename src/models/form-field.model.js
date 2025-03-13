import { errorHandler } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const list = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const promise = knex
    .select('*')
    .from(`${MODULE.FORM_FIELDS}`)
    .where({
      tenant: params.tenant,
      isDeleted: false,
    })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere('title', 'ilike', `%${params.search || ''}%`).orWhere(
          'type',
          'ilike',
          `%${params.search || ''}%`
        );
      }
    })
    .orderBy('created_at', 'desc')
    .offset(params.page * params.size)
    .limit(params.size);

  const countPromise = knex
    .count('* as total')
    .from(`${MODULE.FORM_FIELDS} as ff`)
    .where({
      'ff.tenant': params.tenant,
      'ff.is_deleted': false,
    })
    .andWhere((qb) => {
      if (params.search) {
        qb.orWhere('ff.title', 'ilike', `%${params.search || ''}%`).orWhere(
          'ff.type',
          'ilike',
          `%${params.search || ''}%`
        );
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
    const newError = new Error(`No form fields found`);
    newError.detail = `No form fields found`;
    newError.code = HTTP_STATUS.BAD_REQUEST;
    throw newError;
  }

  return {
    list: result,
    total: Number(countResult[0].total),
  };
};

const create = async (req, body) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex.transaction(async (trx) => {
    try {
      const existing = await trx(MODULE.FORM_FIELDS)
        .where((builder) => {
          if (body.title) builder.orWhere({ 'form_fields.title': body.title });
          if (body.type) builder.orWhere({ 'form_fields.type': body.type });
        })
        .andWhere({
          'form_fields.is_deleted': false,
        })
        .first();

      if (existing) {
        const errorMessage = `The title/type is already registered.`;
        errorHandler(errorMessage, HTTP_STATUS.BAD_REQUEST);
      }

      const [formField] = await trx(MODULE.FORM_FIELDS)
        .insert(body)
        .returning('*');

      return formField;
    } catch (error) {
      errorHandler(
        `Error creating form field: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  });
};

const update = async (req, body, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const existing = await knex(MODULE.FORM_FIELDS)
    .where((builder) => {
      if (body.title) builder.orWhere({ 'form_fields.title': body.title });
      if (body.type) builder.orWhere({ 'form_fields.type': body.type });
    })
    .andWhere({
      'form_fields.is_deleted': false,
    })
    .andWhereNot('form_fields.id', params.id)
    .first();

  if (existing) {
    errorHandler(`Title / Type already exists.`, HTTP_STATUS.BAD_REQUEST);
  }

  const [updatedEmployee] = await knex(MODULE.FORM_FIELDS)
    .update(body)
    .where('id', params.id)
    .returning('*');

  return updatedEmployee;
};

const deleteField = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex(MODULE.FORM_FIELDS)
    .where('id', params.id)
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

export default {
  list,
  create,
  update,
  deleteField,
  lov,
};
