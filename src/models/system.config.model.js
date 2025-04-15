import { errorHandler } from '#utilities/db-query-helpers';
import HTTP_STATUS from '#utilities/http-status';
import MODULE from '#utilities/module-names';
import promiseHandler from '#utilities/promise-handler';

const get = async (req, params) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  if (!params.domain) {
    errorHandler(`Domain parameter is missing`, HTTP_STATUS.BAD_REQUEST);
  }
  const promise = knex
    .select(
      `${MODULE.SYSTEM_CONFIG}.*`,
      `tc.logo as tenant_logo`,
      `tc.banner as tenant_banner`
    )
    .leftJoin(
      `${MODULE.TENANT_CONFIG} as tc`,
      'tc.tenant',
      `${MODULE.SYSTEM_CONFIG}.tenant`
    )
    .from(MODULE.SYSTEM_CONFIG)
    .where({
      domain: params.domain,
    })
    .first();
  const [error, result] = await promiseHandler(promise);
  if (error) {
    errorHandler(`something went wrong`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  if (!result) {
    errorHandler(`System config not found`, HTTP_STATUS.BAD_REQUEST);
  }
  return result;
};

const defaultTheme = async (req) => {
  const theme = req.knex(MODULE.THEME).where('key', 'DEFAULT').first();
  return theme;
};

export default {
  get,
  defaultTheme,
};
