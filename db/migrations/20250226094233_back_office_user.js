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
    .createTable('back_office_user', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('tenant').nullable();
      table.foreign('tenant').references('tenant.id');
      table.text('first_name').nullable();
      table.text('last_name').nullable();
      table.text('username').notNullable();
      table.text('email').notNullable();
      table.text('password').notNullable();
      table.text('phone').nullable();
      table.text('country').nullable();
      table.text('state').nullable();
      table.text('city').nullable();
      table.text('zip_code').nullable();
      table.uuid('role').nullable();
      table.text('avatar').nullable();
      table.text('address').nullable();
      table
        .enum('user_type', ['SUPER_USER', 'USER'], {
          useNative: true,
          enumName: 'back_office_user_type',
          schemaName: 'public',
        })
        .notNullable();

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
    .raw(createTriggerUpdateTimestampTrigger('back_office_user'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema
    .dropTable('back_office_user')
    .raw(dropType('back_office_user_type'));
}
