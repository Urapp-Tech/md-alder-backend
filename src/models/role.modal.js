import { errorHandler, textFilterHelper } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const list = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const query = knex
    .from(MODULE.ROLE)
    .where({
      'role.is_active': true,
    })
    .modify(textFilterHelper(params.search, ['role.name', 'role.desc']));

  const promise = query
    .clone()
    .select('*')
    .orderBy('role.created_at', 'asc')
    .offset(params.page * params.size)
    .limit(params.size);

  const countPromise = query.clone().count('* as total');

  const [error, result] = await promiseHandler(promise);
  const [countError, countResult] = await promiseHandler(countPromise);

  if (error || countError) {
    errorHandler(`Something went wrong`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  if (!result || !countResult) {
    errorHandler(`No permissions found`, HTTP_STATUS.BAD_REQUEST);
  }

  return {
    list: result,
    total: Number(countResult[0].total),
  };
};

const create = async (req, params) => {
  /** @type {import('knex').Knex} */
  const trx = await req.knex.transaction();
  const body = req.body;
  try {
    const newData = [];

    const roleData = {
      name: body.name,
      desc: body.desc,
      isActive: true,
      createdBy: params.id,
      updatedBy: params.id,
    };

    const [role] = await trx(MODULE.ROLE).insert(roleData).returning('*');

    if (!role) {
      errorHandler(`Role Data Is Not Provided`, HTTP_STATUS.BAD_REQUEST);
    }

    for (const group of body.data) {
      for (const item of group.data) {
        newData.push({
          role: role.id,
          permission: item.id,
          createdBy: params.id,
          updatedBy: params.id,
          isActive: !!item.status,
        });
      }
    }

    if (!newData.length) {
      errorHandler(
        `Role permission Data Is Not Provided`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const inserted = await trx(MODULE.ROLE_PERMISSION).insert(newData);

    if (!inserted || inserted.rowCount <= 0) {
      errorHandler(`Role permission is not inserting`, HTTP_STATUS.BAD_REQUEST);
    }

    await trx.commit();
    return role;
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

const update = async (req, params) => {
  const { name, desc, data } = req.body;
  const knex = req.knex;

  const transaction = await knex.transaction();
  try {
    const activeIds = [];
    const inactiveIds = [];

    const rolePermissionList = await knex
      .select('*')
      .from(MODULE.ROLE_PERMISSION)
      .where('role', params.roleId);

    const roleData = {
      name,
      desc,
      updatedBy: params.id,
    };

    const role = await transaction(MODULE.ROLE)
      .update(roleData)
      .where('id', params.roleId);

    if (!role) {
      await transaction.rollback();
      errorHandler(`Role id not found.`, HTTP_STATUS.BAD_REQUEST);
    }

    const newData = [];
    for (const newItem of data) {
      for (const item of newItem.data) {
        const exists = rolePermissionList.some(
          (perm) => perm.role === params.roleId && perm.permission === item.id
        );

        if (exists) {
          if (item.status) {
            activeIds.push(item.id);
          } else {
            inactiveIds.push(item.id);
          }
        } else {
          newData.push({
            role: params.roleId,
            permission: item.id,
            createdBy: params.id,
            updatedBy: params.id,
            isActive: true,
          });
        }
      }
    }

    if (activeIds.length > 0) {
      const updated = await transaction(MODULE.ROLE_PERMISSION)
        .update({ isActive: true })
        .where('role', params.roleId)
        .whereIn('permission', activeIds);

      if (updated <= 0) {
        await transaction.rollback();
        errorHandler(`No Role Permission Update`, HTTP_STATUS.BAD_REQUEST);
      }
    }

    if (inactiveIds.length > 0) {
      const updated = await transaction(MODULE.ROLE_PERMISSION)
        .update({ isActive: false })
        .where('role', params.roleId)
        .whereIn('permission', inactiveIds);

      if (updated <= 0) {
        await transaction.rollback();
        errorHandler(
          `Role permission is not updated.`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    if (newData.length > 0) {
      const inserted = await transaction(MODULE.ROLE_PERMISSION)
        .insert(newData)
        .returning('*');

      if (inserted.rowCount <= 0) {
        await transaction.rollback();
        errorHandler(
          `Role Permission Data Is Not Provided.`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const commit = await transaction.commit();
    if (commit?.response?.rowCount !== null) {
      await transaction.rollback();
      throw Object.assign(new Error('Commit Failed'), {
        detail: 'Commit service is not executed.',
        code: HTTP_STATUS.BAD_REQUEST,
      });
    }

    return role;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateStatus = async (req, params) =>
  req.knex(MODULE.ROLE).update(req.body).where('id', params.id).returning('*');

const permissions = async (req) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  try {
    const permissionList = await knex
      .select(['id', 'name', 'desc', 'permission_parent'])
      .from(MODULE.PERMISSION)
      .where({ isActive: true });

    const parentPermissions = permissionList.filter(
      (item) => item.permissionParent === null
    );

    const groupedPermissions = parentPermissions.map((parent) => {
      const children = permissionList
        .filter((child) => child.permissionParent === parent.id)
        .map((child) => ({ ...child, status: false }));

      return {
        name: parent.name,
        data: children,
      };
    });

    return {
      items: groupedPermissions,
      message: 'Permissions list has been fetched successfully.',
      code: HTTP_STATUS.OK,
    };
  } catch (error) {
    return {
      hasError: true,
      message: error.detail ?? error.message,
      code: error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
};

const getPermissionsById = async (req, params) => {
  const result = {};
  const knex = req.knex;

  try {
    const roleId = params.roleId;

    const findResult = await knex(MODULE.ROLE)
      .select('*')
      .where('id', roleId)
      .first();

    if (!findResult) {
      errorHandler(`Role not found`, HTTP_STATUS.NOT_FOUND);
    }

    const findPermissions = await knex(MODULE.ROLE_PERMISSION)
      .select('*')
      .where('role', findResult.id);

    const permissionList = await knex(MODULE.PERMISSION).select('*');
    const generateArr = [];

    const parentPermissions = permissionList.filter(
      (perm) => perm.permissionParent === null
    );

    parentPermissions.forEach((parent) => {
      const children = permissionList.filter(
        (perm) => perm.permissionParent === parent.id
      );

      const mappedChildren = children.map((child) => {
        const matched = findPermissions.find(
          (rp) => rp.permission === child.id && rp.role === roleId
        );
        return {
          ...child,
          status: matched ? matched.isActive : false,
        };
      });

      generateArr.push({
        name: parent.name,
        data: mappedChildren,
      });
    });

    result.items = {
      id: roleId,
      name: findResult.name,
      desc: findResult.desc,
      data: generateArr,
    };
  } catch (error) {
    result.message = error.detail ?? error.message ?? 'Something went wrong';
    result.code = error.code ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  return result;
};

const lov = async (req) => {
  return req.knex(MODULE.ROLE).select('id', 'name').where('is_active', true);
};

export default {
  list,
  create,
  update,
  updateStatus,
  permissions,
  getPermissionsById,
  lov,
};
