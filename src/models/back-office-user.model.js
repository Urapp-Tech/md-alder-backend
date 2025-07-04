import { hashAsync } from '#utilities/bcrypt';
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
      `${MODULE.ADMIN.BACK_OFFICE_USER}.*`,
      knex.raw(
        jsonBuildObject(MODULE.ADMIN.TENANT_CONFIG, [
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
    .from(MODULE.ADMIN.BACK_OFFICE_USER)
    .leftJoin(
      MODULE.ADMIN.TENANT_CONFIG,
      `${MODULE.ADMIN.BACK_OFFICE_USER}.tenant`,
      `${MODULE.ADMIN.TENANT_CONFIG}.tenant`
    )
    .where((qb) => {
      qb.orWhere(`${MODULE.ADMIN.BACK_OFFICE_USER}.email`, req.body.identifier);
      qb.orWhere(`${MODULE.ADMIN.BACK_OFFICE_USER}.phone`, req.body.identifier);
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

const getBranchById = async (req, id) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const promise = knex
    .select('branch')
    .from(MODULE.ADMIN.BACK_OFFICE_USER_TENANT_BRANCH)
    .where({
      backOfficeUser: id,
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
    .from(MODULE.ADMIN.BACK_OFFICE_USER)
    .leftJoin(
      `${MODULE.ADMIN.BACK_OFFICE_USER_TENANT_BRANCH} as butb`,
      'back_Office_user.id',
      '=',
      'butb.back_Office_user'
    )
    .where({
      'back_Office_user.tenant': params.tenant,
      'back_Office_user.is_deleted': false,
      'back_Office_user.user_type': 'USER',
    })
    .andWhere((qb) => {
      if (params.branch) {
        qb.andWhere('butb.branch', params.branch);
      }
    })
    .modify(
      textFilterHelper(params.search, [
        'back_Office_user.first_name',
        'back_Office_user.last_name',
        'back_Office_user.email',
      ])
    );

  const promise = query
    .clone()
    .select('back_Office_user.*')
    .orderBy('back_Office_user.created_at', 'desc')
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

const create = async (req, params) => {
  const body = req.body;

  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex.transaction(async (trx) => {
    try {
      const existingUser = await trx(MODULE.ADMIN.BACK_OFFICE_USER)
        .leftJoin(
          `${MODULE.ADMIN.BACK_OFFICE_USER_TENANT_BRANCH} as butb`,
          'back_Office_user.id',
          'butb.back_Office_user'
        )
        .where((builder) => {
          if (body.email)
            builder.orWhere({ 'back_Office_user.email': body.email });
          if (body.phone)
            builder.orWhere({ 'back_Office_user.phone': body.phone });
        })
        .andWhere({
          'back_Office_user.is_deleted': false,
          'back_Office_user.user_type': 'USER',
          'butb.branch': params.branch,
        })
        .first();

      if (existingUser) {
        errorHandler(
          'The Email / Phone is already registered to another employee.',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const branchRecord = await trx(MODULE.ADMIN.BRANCH)
        .where({ id: params.branch })
        .first();

      if (!branchRecord) {
        errorHandler(`No branch found`, HTTP_STATUS.BAD_REQUEST);
      }

      const newPassword = await hashAsync(body.password);

      const branchType = branchRecord.branchType === 'MAIN' ? 'MAIN' : 'OTHER';

      const [backOfficeUser] = await trx(MODULE.ADMIN.BACK_OFFICE_USER)
        .insert({
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          username: body.email,
          password: newPassword,
          phone: body.phone,
          address: body.address,
          tenant: params.tenant,
          userType: body.userType,
        })
        .returning('*');

      await trx(MODULE.ADMIN.BACK_OFFICE_USER_TENANT_BRANCH).insert({
        tenant: params.tenant,
        branch: params.branch,
        backOfficeUser: backOfficeUser.id,
        type: branchType,
      });

      return backOfficeUser;
    } catch (error) {
      errorHandler(
        `Error creating backOfficeUser: ${error.message}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  });
};

const update = async (req, body, params) => {
  const { email, phone } = body;

  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const existingUser = await knex(MODULE.ADMIN.BACK_OFFICE_USER)
    .leftJoin(
      `${MODULE.ADMIN.BACK_OFFICE_USER_TENANT_BRANCH} as butb`,
      'back_Office_user.id',
      'butb.back_Office_user'
    )
    .where((builder) => {
      if (email) builder.orWhere({ 'back_Office_user.email': email });
      if (phone) builder.orWhere({ 'back_Office_user.phone': phone });
    })
    .andWhere({
      'back_Office_user.is_deleted': false,
      'back_Office_user.user_type': 'USER',
      'butb.branch': params.branch,
    })
    .andWhereNot('back_Office_user.id', params.userId)
    .first();

  if (existingUser) {
    errorHandler(
      `An employee with the email / phone already exists.`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const [updatedEmployee] = await knex(MODULE.ADMIN.BACK_OFFICE_USER)
    .update(body)
    .where('id', params.userId)
    .returning('*');

  return updatedEmployee;
};

const deleteUser = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex(MODULE.ADMIN.BACK_OFFICE_USER)
    .where('id', params.userId)
    .update({ isDeleted: true });
};

export default {
  login,
  getBranchById,
  list,
  create,
  update,
  deleteUser,
};
