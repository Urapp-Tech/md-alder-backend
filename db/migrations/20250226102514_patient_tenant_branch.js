import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('patient_tenant_branch', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('patient').nullable();
      table.foreign('patient').references('patient.id');
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
    .raw(createTriggerUpdateTimestampTrigger('patient_tenant_branch'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('patient_tenant_branch');
}
