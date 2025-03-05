import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('back_office_user_tenant_branch', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('back_office_user').nullable();
      table.foreign('back_office_user').references('back_office_user.id');
      table.uuid('tenant').notNullable();
      table.foreign('tenant').references('tenant.id');
      table.uuid('branch').notNullable();
      table.foreign('branch').references('branch.id');
      table
        .enum('type', ['MAIN', 'OTHER'], {
          useNative: true,
          existingType: true,
          enumName: 'branch_type',
          schemaName: 'public',
        })
        .nullable();
    })
    .raw(createTriggerUpdateTimestampTrigger('back_office_user_tenant_branch'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('back_office_user_tenant_branch');
}
