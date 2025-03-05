import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('doctor', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('tenant').nullable();
      table.foreign('tenant').references('tenant.id');
      table.text('name').notNullable();
      table.text('bio').notNullable();
      table.text('gender').notNullable();
      table.text('phone').notNullable();
      table.text('email').notNullable();
      table.text('age').notNullable();
      table.text('address').nullable();
      table.text('designation').notNullable();
      table.text('expertise').notNullable();
      table.text('board_certification').notNullable();
      table.text('college').notNullable();
      table.text('university').notNullable();
      table.text('followship').notNullable();
      table.jsonb('experience').nullable();
      table.jsonb('skills').nullable();
      table.jsonb('languages').nullable();
      table.jsonb('social').nullable();
      table.jsonb('schedule').nullable();
      table.text('avatar').nullable();
      table.boolean('is_active').defaultTo(true);
      table.boolean('is_deleted').defaultTo(false);
      table.timestamps(true, true);

      table.unique(['email'], {
        predicate: knex.whereRaw('is_active = true AND is_deleted = false'),
      });
      table.unique(['phone'], {
        predicate: knex.whereRaw('is_active = true AND is_deleted = false'),
      });
    })
    .raw(createTriggerUpdateTimestampTrigger('doctor'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('doctor');
}
