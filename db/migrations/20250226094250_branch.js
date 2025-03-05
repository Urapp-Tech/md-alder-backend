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
    .createTable('branch', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('back_office_user').nullable();
      table.foreign('back_office_user').references('back_office_user.id');
      table.uuid('tenant').notNullable();
      table.foreign('tenant').references('tenant.id');
      table.text('name');
      table.text('mobile').nullable();
      table.text('landline').nullable();
      table.text('address').nullable();
      table.text('description').nullable();
      table.decimal('latitude', 10, 8).defaultTo(0);
      table.decimal('longitude', 10, 8).defaultTo(0);
      table.integer('attendance_distance').defaultTo(0);
      table.timestamp('office_time_in').nullable();
      table.timestamp('office_time_out').nullable();

      table.boolean('is_active').defaultTo(true).notNullable();
      table.boolean('is_deleted').defaultTo(false).notNullable();
      table.unique(['tenant', 'name'], {
        predicate: knex.whereRaw('is_deleted = false'),
      });

      table
        .enum('branch_type', ['MAIN', 'OTHER'], {
          useNative: true,
          enumName: 'branch_type',
          schemaName: 'public',
        })
        .nullable();
      table.unique(['tenant', 'branch_type'], {
        predicate: knex.whereRaw(`branch_type = 'MAIN'`),
      });
      table.timestamps(true, true);
    })
    .raw(createTriggerUpdateTimestampTrigger('branch'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('branch').raw(dropType('branch_type'));
}
