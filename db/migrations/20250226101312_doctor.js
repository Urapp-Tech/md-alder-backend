import {
  createTriggerUpdateTimestampTrigger,
  dropType,
} from '../knex.utilities.js';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('doctor', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('tenant').notNullable();
      table.foreign('tenant').references('tenant.id');
      table.text('first_name').notNullable();
      table.text('last_name').notNullable();
      table.text('username').notNullable();
      table.text('email').notNullable();
      table.text('password').notNullable();
      table.text('phone').notNullable();
      table.timestamp('dob').nullable();
      table
        .enum('gender', ['MALE', 'FEMALE'], {
          useNative: true,
          enumName: 'gender',
          schemaName: 'public',
        })
        .nullable();
      table.text('designation').nullable();
      table.text('expertise').nullable();
      table.text('board_certification').nullable();
      table.text('college').nullable();
      table.text('university').nullable();
      table.text('fellowship').nullable();
      table.text('address').nullable();
      table.text('biography').nullable();
      table.jsonb('experience').nullable();
      table.jsonb('skill').nullable();
      table.jsonb('languages').nullable();
      table.jsonb('social_media').nullable();
      table.jsonb('add_date_time').nullable();
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
  return knex.schema.dropTable('doctor').raw(dropType('gender'));
}
