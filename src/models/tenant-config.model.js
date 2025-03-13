import MODULE from '#utilities/module-names';

const getTenantConfigByTenantId = (req, tenantId) => {
  /** @type {import('knex').Knex} */
  const knex = req.knex;

  return knex
    .select('*')
    .from(MODULE.TENANT_CONFIG)
    .where('tenant', tenantId)
    .first();
};

export default {
  getTenantConfigByTenantId,
};
