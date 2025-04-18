/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable('patient', (table) => {
    table.uuid('back_office_user').nullable();
    table.foreign('back_office_user').references('back_office_user.id');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.alterTable('patient', (table) => {
    table.dropForeign('back_office_user');
    table.dropColumn('back_office_user');
  });
}
