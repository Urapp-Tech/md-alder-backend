/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable('back_office_user', (table) => {
    table.specificType('gender', 'public.gender').nullable();
    table.text('age').nullable();
    table.text('designation').nullable();
    table.text('expertise').nullable();
    table.text('board_certification').nullable();
    table.text('college').nullable();
    table.text('university').nullable();
    table.text('fellowship').nullable();
    table.text('bio').nullable();
    table.jsonb('experience').nullable();
    table.jsonb('skill').nullable();
    table.jsonb('languages').nullable();
    table.jsonb('social_media').nullable();
    table.jsonb('add_date_time').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable('back_office_user', (table) => {
    table.dropColumn('gender');
    table.dropColumn('age');
    table.dropColumn('designation');
    table.dropColumn('expertise');
    table.dropColumn('board_certification');
    table.dropColumn('college');
    table.dropColumn('university');
    table.dropColumn('fellowship');
    table.dropColumn('bio');
    table.dropColumn('experience');
    table.dropColumn('skill');
    table.dropColumn('languages');
    table.dropColumn('social_media');
    table.dropColumn('add_date_time');
  });
}
