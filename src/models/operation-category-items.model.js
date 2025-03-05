import { errorHandler, textFilterHelper } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import POSTGRES_ERROR_CODES from '#utilities/postgres_error_codes';
import promiseHandler from '#utilities/promise-handler';

const list = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const query = knex
    .from(MODULE.ADMIN.OPERATION_CATEGORY_ITEM)
    .where({
      tenant: params.tenant,
      branch: params.branch,
      operationCategory: params.operationCategory,
      isDeleted: false,
      isActive: true,
    })
    .modify(textFilterHelper(params.search, 'name'));

  const promise = query
    .clone()
    .select('*')
    .orderBy('createdAt', 'desc')
    .offset(params.page * params.size)
    .limit(params.size);

  const countPromise = query.clone().count('* as total');

  const [error, result] = await promiseHandler(promise);
  const [countError, countResult] = await promiseHandler(countPromise);

  if (error || countError) {
    errorHandler(`something went wrong`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return {
    list: result,
    total: Number(countResult[0].total),
  };
};

const create = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;
  const body = req.body;
  const transaction = await knex.transaction();

  const existingOperationCatItem = await transaction(
    MODULE.ADMIN.OPERATION_CATEGORY_ITEM
  )
    .where((builder) => {
      builder
        .whereRaw('LOWER(name) = LOWER(?)', [body.name])
        .andWhere({ branch: params.branch })
        .andWhere({ operationCategory: body.operationCategory })
        .andWhere({ isDeleted: false });
    })
    .first();

  if (existingOperationCatItem) {
    await transaction.rollback();
    errorHandler(
      `This Category Item is already registered.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const promise = transaction
    .from(MODULE.ADMIN.OPERATION_CATEGORY_ITEM)
    .insert({
      tenant: params.tenant,
      branch: params.branch,
      name: body.name,
      operationCategory: body.operationCategory,
    })
    .returning('*');

  const [error, [result]] = await promiseHandler(promise);

  if (error) {
    await transaction.rollback();
    if (error.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
      errorHandler(error.detail, HTTP_STATUS.CONFLICT);
    }
    errorHandler(
      `failed to create operation category item`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  await transaction.commit();

  return result;
};

const update = async (req, body, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const transaction = await knex.transaction();

  const existingOperationCatItem = await transaction(
    MODULE.ADMIN.OPERATION_CATEGORY_ITEM
  )
    .where((builder) => {
      builder
        .whereRaw('LOWER(name) = LOWER(?)', [body.name])
        .andWhere({ branch: params.branch })
        .andWhere({ isDeleted: false })
        .andWhereNot('id', params.operationCategoryItemId);
    })
    .first();

  if (existingOperationCatItem) {
    await transaction.rollback();
    errorHandler(
      `This Category Item is already registered.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const promise = transaction
    .from(MODULE.ADMIN.OPERATION_CATEGORY_ITEM)
    .where({
      tenant: params.tenant,
      branch: params.branch,
      id: params.operationCategoryItemId,
    })
    .update({
      name: body.name,
    })
    .returning('*');

  const [error, [result]] = await promiseHandler(promise);

  if (error) {
    await transaction.rollback();
    if (error.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
      errorHandler(error.detail, HTTP_STATUS.CONFLICT);
    }
    errorHandler(
      `failed to update operation category item`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  await transaction.commit();

  return result;
};

const remove = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const transaction = await knex.transaction();

  const promise = transaction
    .from(MODULE.ADMIN.OPERATION_CATEGORY_ITEM)
    .where({
      tenant: params.tenant,
      branch: params.branch,
      id: params.operationCategoryItemId,
    })
    .update({
      isActive: false,
      isDeleted: true,
    })
    .returning('id');

  const [error, [result]] = await promiseHandler(promise);

  if (error) {
    await transaction.rollback();
    if (error.code === POSTGRES_ERROR_CODES.UNIQUE_VIOLATION) {
      errorHandler(error.detail, HTTP_STATUS.CONFLICT);
    }
    errorHandler(
      `failed to update operation category item`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  await transaction.commit();

  return result;
};

const lov = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  try {
    const listValues = await knex
      .select('id', 'name')
      .from(MODULE.ADMIN.OPERATION_CATEGORY_ITEM)
      .where({ branch: params.branch, isDeleted: false, isActive: true })
      .orderBy('name', 'asc');

    return listValues;
  } catch (error) {
    errorHandler(
      `Error fetching LOV: ${error.message}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export default {
  list,
  create,
  update,
  remove,
  lov,
};
