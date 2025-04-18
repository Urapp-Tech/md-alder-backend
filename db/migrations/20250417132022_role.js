import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema
    .createTable('role', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.text('name').notNullable();
      table.text('desc');
      table.uuid('created_by');
      table.uuid('updated_by');
      table.uuid('tenant');
      table.foreign('tenant').references('tenant.id');
      table.boolean('is_active').defaultTo(false);
      table.timestamps(true, true);
    })
    .raw(createTriggerUpdateTimestampTrigger('role'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('role');
}
