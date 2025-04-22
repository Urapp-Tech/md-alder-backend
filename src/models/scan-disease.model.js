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

const create = async (req, body, params) => {
  body.tenant = params.tenant;
  try {
    /** @type {import('knex').Knex} */
    const knex = req.knex;
    const [scanDisease] = await knex(MODULE.SCAN_DISEASE)
      .insert(body)
      .returning('*');

    return scanDisease;
  } catch (error) {
    errorHandler(
      `Error creating form field: ${error.message}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
};

export default {
  list,
  create,
};
