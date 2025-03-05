import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('system_config', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('tenant').notNullable();
      table.foreign('tenant').references('tenant.id');
      table.uuid('theme').nullable();
      table.foreign('theme').references('theme.id');
      table.text('domain').notNullable();
      table.jsonb('assign_themes').nullable();
      table.timestamps(true, true);
      table.unique(['tenant']);
    })
    .raw(createTriggerUpdateTimestampTrigger('system_config'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('system_config');
}
