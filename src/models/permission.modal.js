import { toKebabCase } from '#utilities/case-converter';
import { errorHandler, textFilterHelper } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const list = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const columns = [
    'id',
    'name',
    'desc',
    'permission_type',
    'is_active',
    'created_at',
  ];

  const query = knex
    .from(MODULE.PERMISSION)
    .where({
      'permission.is_active': true,
      'permission.permission_parent': null,
    })
    .modify(
      textFilterHelper(params.search, ['permission.name', 'permission.desc'])
    );

  const promise = query
    .clone()
    .select(columns)
    .orderBy('permission.created_at', 'asc')
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
  const body = req.body;
  const trx = await req.knex.transaction();

  try {
    // Check if the parent permission already exists
    const existingPermission = await trx(MODULE.PERMISSION)
      .select('*')
      .whereRaw('LOWER(name) = ?', [body.name.toLowerCase()])
      .andWhere('permissionParent', null);

    if (existingPermission.length) {
      errorHandler('Permission Already Exist.', HTTP_STATUS.BAD_REQUEST);
    }

    // Create parent permission
    const parentPermission = {
      name: body.name,
      desc: body.desc,
      isActive: true,
      permissionType: body.permission_type,
      createdBy: params.id,
      updatedBy: params.id,
    };

    const [createdParent] = await trx(MODULE.PERMISSION)
      .insert(parentPermission)
      .returning('*');

    if (!createdParent) {
      errorHandler('Permission Data Is Not Provided', HTTP_STATUS.BAD_REQUEST);
    }

    // Prepare child permissions
    // const apiLink = `${SERVER_BASE_PATH}/admin/`;
    const urlParam = toKebabCase({ txt: createdParent.name }).txt;

    const childPermissions = [];

    for (const [index, item] of body.data.entries()) {
      const exists = await trx(MODULE.PERMISSION)
        .where('name', item.name)
        .andWhere('id', createdParent.id)
        .first();

      if (exists) {
        errorHandler('Permission Already Existss.', HTTP_STATUS.BAD_REQUEST);
      }

      childPermissions.push({
        isActive: true,
        permissionSequence: index + 1,
        permissionParent: createdParent.id,
        permissionType: body.permission_type,
        createdBy: params.id,
        updatedBy: params.id,
        name: item.name,
        desc: item.desc,
        action: `${urlParam}/${item.action}`,
        showOnMenu: item.show_on_menu,
      });
    }

    // Insert child permissions
    const inserted = await trx(MODULE.PERMISSION)
      .insert(childPermissions)
      .returning('*');

    if (!inserted || inserted.length === 0) {
      errorHandler(
        'Permission Child Data Is Not Provided',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    await trx.commit();
    return createdParent;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

const update = async (req, params) => {
  const trx = await req.knex.transaction();
  const body = req.body;

  try {
    let existingChildren = await childListOnly(req, params.pid);

    const isNameExists = await trx(MODULE.PERMISSION)
      .select('id')
      .where('name', body.name)
      .andWhereNot('id', params.pid);

    const parentUpdatePayload = {
      desc: body.desc,
      permissionType: body.permission_type,
      updatedBy: body.updated_by,
      ...(isNameExists.length === 0 && { name: body.name }),
    };

    const updatedParent = await trx(MODULE.PERMISSION)
      .update(parentUpdatePayload)
      .where({ id: params.pid });

    if (!updatedParent) {
      await trx.rollback();
      errorHandler('Permission Update Query Failed', HTTP_STATUS.BAD_REQUEST);
    }

    // const urlPrefix = `${SERVER_BASE_PATH}/admin/`;
    const urlParam = toKebabCase({ txt: body.name }).txt;
    let index = existingChildren.length;

    for (const item of body.data) {
      const exists = await trx(MODULE.PERMISSION)
        .select('id')
        .where('name', item.name)
        .andWhereNot('id', item.id);

      if (item.id) {
        existingChildren = existingChildren.filter((e) => e.id !== item.id);
        const childUpdateData = {
          desc: item.desc,
          action: item.action,
          permissionType: item.permission_type,
          showOnMenu: item.show_on_menu,
          isActive: item.is_active,
          updatedBy: item.updated_by,
          ...(exists.length === 0 && { name: item.name }),
        };

        const updatedChild = await trx(MODULE.PERMISSION)
          .update(childUpdateData)
          .where({ id: item.id });

        if (!updatedChild) {
          await trx.rollback();
          errorHandler('Child Update Query Failed', HTTP_STATUS.BAD_REQUEST);
        }
      } else if (exists.length === 0) {
        index++;
        const newChild = {
          name: item.name,
          desc: item.desc,
          action: `${urlParam}/${item.action}`,
          showOnMenu: item.show_on_menu,
          isActive: true,
          permissionSequence: index,
          permissionParent: params.pid,
          permissionType: body.permission_type,
          createdBy: params.id,
          updatedBy: params.id,
        };

        const inserted = await trx(MODULE.PERMISSION).insert(newChild);
        if (!inserted || inserted.rowCount <= 0) {
          await trx.rollback();
          errorHandler('Insert Failed for Child', HTTP_STATUS.BAD_REQUEST);
        }
      }
    }

    // Deactivate unused child permissions
    const deleteIds = existingChildren.map((e) => e.id);
    if (deleteIds.length > 0) {
      const deleted = await trx(MODULE.PERMISSION)
        .update({ isActive: false, showOnMenu: false })
        .whereIn('id', deleteIds);

      if (!deleted) {
        await trx.rollback();
        errorHandler('Deletion Update Failed', HTTP_STATUS.BAD_REQUEST);
      }
    }

    await trx.commit();
    return updatedParent;
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

const updateStatus = async (req, params) =>
  req
    .knex(MODULE.PERMISSION)
    .update(req.body)
    .where('id', params.id)
    .returning('*');

const edit = async (req, params) => {
  const permission = await req
    .knex(MODULE.PERMISSION)
    .select('*')
    .where('id', params.id)
    .first();

  const childPermission = await req
    .knex(MODULE.PERMISSION)
    .select('*')
    .where({ permissionParent: params.id, isActive: true });

  const newData = {
    id: permission.id,
    name: permission.name,
    desc: permission.desc,
    permissionType: permission.permission_type,
    data: childPermission,
  };
  return newData;
};

const childList = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const columns = [
    'id',
    'name',
    'desc',
    'action',
    'show_on_menu',
    'permission_sequence',
    'permission_parent',
    'permission_type',
    'created_by',
    'updated_by',
    'is_active',
  ];

  const query = knex.select(columns).from(MODULE.PERMISSION).where({
    permissionParent: params.pid,
  });

  // 🔍 Search filter
  if (params.search) {
    query.andWhere((qb) => {
      qb.whereILike('name', `%${params.search}%`).orWhereILike(
        'desc',
        `%${params.search}%`
      );
    });
  }

  query.orderBy('permission_sequence', 'asc');

  const [error, result] = await promiseHandler(query);
  if (error) {
    throw new Error(`Failed to fetch child permissions: ${error.message}`);
  }

  return {
    list: result,
    total: result.length,
  };
};

const childListOnly = async (req, id) => {
  const columns = [
    'id',
    'name',
    'desc',
    'permission_sequence',
    'permission_parent',
    'action',
    'permission_type',
    'is_active',
    'show_on_menu',
    'created_at',
  ];

  return req.knex
    .select(columns)
    .from(MODULE.PERMISSION)
    .where('permission_parent', id)
    .orderBy('created_at', 'desc');
};

export default {
  list,
  create,
  childList,
  update,
  updateStatus,
  edit,
};
