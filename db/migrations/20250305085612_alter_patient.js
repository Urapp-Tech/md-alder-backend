/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable('patient', (table) => {
    table.dropColumn('status');
    table.text('desc').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.alterTable('patient', (table) => {
    table.dropColumn('desc');
    table.text('status').nullable();
  });
}
