import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('tenant_config', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('tenant').notNullable();
      table.foreign('tenant').references('tenant.id');
      table.text('name').notNullable();
      table.text('email').nullable();
      table.double('tax').nullable();
      table.text('logo').nullable();
      table.text('banner').nullable();
      table.text('address').nullable();
      table.text('desc').nullable();
      table.jsonb('media').nullable();
      table.timestamps(true, true);
      table.unique(['tenant']);
      table.unique(['name']);
    })
    .raw(createTriggerUpdateTimestampTrigger('tenant_config'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('tenant_config');
}
