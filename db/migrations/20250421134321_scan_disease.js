import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema
    .createTable('scan_disease', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('tenant');
      table.foreign('tenant').references('tenant.id');
      table.jsonb('results').nullable();
      table.text('avatar').notNullable();
      table.timestamps(true, true);
    })
    .raw(createTriggerUpdateTimestampTrigger('scan_disease'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('scan_disease');
}
