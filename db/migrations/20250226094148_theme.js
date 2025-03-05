import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('theme', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.text('key').notNullable();
      table.jsonb('value').notNullable();
      table.timestamps(true, true);
      table.unique('key');
    })
    .raw(createTriggerUpdateTimestampTrigger('theme'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('theme');
}
