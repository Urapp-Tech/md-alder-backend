import { createTriggerUpdateTimestampTrigger } from '../knex.utilities.js';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('patient_visit_history', (table) => {
      table.uuid('id').primary().defaultTo(knex.fn.uuid());
      table.uuid('tenant').nullable();
      table.foreign('tenant').references('tenant.id');
      table.uuid('patient').nullable();
      table.foreign('patient').references('patient.id');
      table.text('medical_note').nullable();
      table.text('chief_complaint').nullable();
      table.text('complaint_type').nullable();
      table.text('symptoms').nullable();
      table.text('diagnose').nullable();
      table.text('differential_diagnose').nullable();
      table.text('complaint_duration_start_time').nullable();
      table.text('complaint_duration_end_time').nullable();
      table.text('complaint_follow_up_time').nullable();
      table.jsonb('prescriptions').nullable();
      table.boolean('cbc').defaultTo(false);
      table.boolean('uce').defaultTo(false);
      table.boolean('lft').defaultTo(false);
      table.boolean('urine_dr').defaultTo(false);
      table.boolean('biopsy').defaultTo(false);
      table.boolean('radiology').defaultTo(false);
      table.text('other_labs_desc').nullable();
      table.jsonb('scan_media').nullable();
      table.boolean('is_active').defaultTo(true);
      table.boolean('is_deleted').defaultTo(false);
      table.timestamps(true, true);
    })
    .raw(createTriggerUpdateTimestampTrigger('patient_visit_history'));
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('patient_visit_history');
}
