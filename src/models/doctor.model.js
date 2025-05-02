import {
  errorHandler,
  jsonBuildObject,
  textFilterHelper,
} from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const login = async (req) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const promise = knex
    .select(
      `${MODULE.DOCTOR}.*`,
      knex.raw(
        jsonBuildObject(MODULE.TENANT_CONFIG, [
          'id',
          'name',
          'address',
          'desc',
          'logo',
          'banner',
          'media',
        ])
      )
    )
    .from(MODULE.DOCTOR)
    .leftJoin(
      MODULE.TENANT_CONFIG,
      `${MODULE.DOCTOR}.tenant`,
      `${MODULE.TENANT_CONFIG}.tenant`
    )
    .where((qb) => {
      qb.orWhere(`${MODULE.DOCTOR}.email`, req.body.identifier);
      qb.orWhere(`${MODULE.DOCTOR}.phone`, req.body.identifier);
    })
    .first();

  const [error, result] = await promiseHandler(promise);

  if (error) {
    const newError = new Error(`something went wrong`);
    newError.detail = `something went wrong`;
    newError.code = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw newError;
  }

  if (!result) {
    const newError = new Error(`No user found`);
    newError.detail = `No user found`;
    newError.code = HTTP_STATUS.BAD_REQUEST;
    throw newError;
  }

  return result;
};

const getBranchById = async (req, tenant) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const promise = knex.select('branch').from(MODULE.BRANCH).where({
    tenant,
  });
  const [error, result] = await promiseHandler(promise);
  if (error) {
    const newError = new Error(`something went wrong`);
    newError.detail = `something went wrong`;
    newError.code = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw newError;
  }
  if (!result) {
    const newError = new Error(`No branch found`);
    newError.detail = `No branch found`;
    newError.code = HTTP_STATUS.BAD_REQUEST;
    throw newError;
  }
  return result;
};

const list = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const query = knex
    .from(MODULE.DOCTOR)
    .where({
      'doctor.tenant': params.tenant,
      'doctor.is_deleted': false,
    })
    .modify(
      textFilterHelper(params.search, [
        'doctor.first_name',
        'doctor.last_name',
        'doctor.email',
      ])
    );

  const promise = query
    .clone()
    .select('doctor.*')
    .orderBy('doctor.created_at', 'desc')
    .offset(params.page * params.size)
    .limit(params.size);

  const countPromise = query.clone().count('* as total');

  const [error, result] = await promiseHandler(promise);
  const [countError, countResult] = await promiseHandler(countPromise);

  if (error || countError) {
    errorHandler(`something went wrong`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  if (!result || !countResult) {
    errorHandler(`No user found`, HTTP_STATUS.BAD_REQUEST);
  }

  return {
    list: result,
    total: Number(countResult[0].total),
  };
};

const create = async (req, data) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const [doctor] = await knex(MODULE.DOCTOR).insert(data).returning('*');

  return doctor;
};

const update = async (req, body) => {
  const { email, phone } = body;

  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const existingUser = await knex(MODULE.DOCTOR)
    .where((builder) => {
      if (email) builder.orWhere({ email: email });
      if (phone) builder.orWhere({ phone: phone });
    })
    .andWhereNot('id', req.params.userId)
    .first();

  if (existingUser) {
    errorHandler(
      `An employee with the email / phone already exists.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const [updatedEmployee] = await knex(MODULE.BACK_OFFICE.USER)
    .update(body)
    .where('id', req.params.userId)
    .returning('*');

  return updatedEmployee;
};

const deleteUser = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex(MODULE.BACK_OFFICE.USER)
    .where('id', params.userId)
    .update({ isDeleted: true });
};

const findByEmail = async (req, email) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex(MODULE.BACK_OFFICE.USER)
    .where({ email, isActive: true, isDeleted: false })
    .first();
};

const docUpdate = async (req, id, body) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const [updatedUser] = await knex(MODULE.BACK_OFFICE.USER)
    .update(body)
    .where('id', id)
    .returning(['id', 'email']);

  return updatedUser;
};

export default {
  login,
  getBranchById,
  list,
  create,
  update,
  deleteUser,
  findByEmail,
  docUpdate,
};
