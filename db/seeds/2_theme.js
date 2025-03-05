const theme = {
  theme_color: {
    faded: '#6A6A6A',
    primary: '#1D1D1D',
    secondary: '#1A1A1A',
    background: '#F0F0F0',
    foreground: '#FFF',
    secondary_2: '#343434',
  },
  category_color: [
    '#E1CCEC',
    '#C8D9DF',
    '#FFE2E2',
    '#C8D9EB',
    '#DFD3C3',
    '#D9D9D9',
  ],
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('theme').insert({
    key: 'DEFAULT',
    value: theme,
  });
}
