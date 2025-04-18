import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema
    .createTable('role_permission', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('role').notNullable();
      table.foreign('role').references('role.id');
      table.uuid('permission').notNullable();
      table.foreign('permission').references('permission.id');
      table.uuid('created_by');
      table.uuid('updated_by');
      table.boolean('is_active').defaultTo(false);
      table.timestamps(true, true);
    })
    .raw(createTriggerUpdateTimestampTrigger('role_permission'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('role_permission');
}
