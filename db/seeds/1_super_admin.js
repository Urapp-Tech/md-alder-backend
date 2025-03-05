import pkg from 'bcryptjs';
const { hashSync } = pkg;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('back_office_user').insert({
    username: 'admin@mdalder.com',
    password: hashSync('12345678', 12),
    email: 'admin@mdalder.com',
    first_name: 'Admin',
    last_name: 'Md-Alder',
    avatar: null,
    user_type: 'SUPER_USER',
    is_active: true,
    is_deleted: false,
  });
}
