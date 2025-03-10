import { errorHandler } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const get = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  const promise = knex
    .select([
      'b.name',
      'b.description',
      'b.address',
      'tc.logo',
      'tc.banner',
      'tc.media',
    ])
    .from(`${MODULE.BRANCH} as b`)
    .leftJoin(`${MODULE.TENANT_CONFIG} as tc`, 'b.tenant', 'tc.tenant')
    .where({
      'b.tenant': params.tenant,
      'b.id': params.branch,
    });

  const [error, result] = await promiseHandler(promise);

  if (error) {
    errorHandler(`something went wrong`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return result[0];
};

const update = async (req, body, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  if (!params.tenant) {
    errorHandler(`Tenant ID is required`, HTTP_STATUS.BAD_REQUEST);
  }

  const trx = await knex.transaction();

  try {
    const tenantUpdate = {
      logo: body.logo,
      banner: body.banner,
      media: body.media,
    };

    await trx(`${MODULE.TENANT_CONFIG}`)
      .where('tenant', params.tenant)
      .update(tenantUpdate);

    // Update branch
    const branchUpdate = {
      name: body.name,
      address: body.address,
      description: body.desc,
    };

    await trx(`${MODULE.BRANCH}`)
      .where({ tenant: params.tenant, id: params.branch })
      .update(branchUpdate);

    const [result] = await trx(`${MODULE.BRANCH} as b`)
      .select([
        'b.name',
        'b.description',
        'b.address',
        'tc.logo',
        'tc.banner',
        'tc.media',
      ])
      .leftJoin(`${MODULE.TENANT_CONFIG} as tc`, 'b.tenant', 'tc.tenant')
      .where({ 'b.tenant': params.tenant, 'b.id': params.branch });

    // Commit the transaction
    await trx.commit();

    return result;
  } catch (error) {
    await trx.rollback();
    // console.error('Update Error:', error);
    return errorHandler(
      `Something went wrong: ${error.message}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};

export default {
  get,
  update,
};
