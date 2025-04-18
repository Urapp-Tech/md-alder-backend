/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable('patient_visit_history', (table) => {
    table.jsonb('lab_media').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.alterTable('patient_visit_history', (table) => {
    table.dropColumn('lab_media');
  });
}
