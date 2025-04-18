import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema
    .createTable('permission', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.text('name').notNullable();
      table.specificType('permission_sequence', 'int2');
      table.uuid('created_by');
      table.uuid('updated_by');
      table.uuid('permission_parent');
      table.text('desc');
      table.text('action');
      table.enu('permission_type', ['frontend', 'backend', 'hybird'], {
        useNative: true,
        enumName: 'permission_type_enum',
      });
      table.boolean('show_on_menu').defaultTo(false);
      table.boolean('is_active').notNullable().defaultTo(false);
      table.timestamps(true, true);
    })
    .raw(createTriggerUpdateTimestampTrigger('permission'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('permission');
  await knex.raw('DROP TYPE IF EXISTS permission_type_enum');
}
