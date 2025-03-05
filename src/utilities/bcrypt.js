// const bcrypt = require('bcryptjs');
import bcrypt from 'bcryptjs';

const saltRounds = 10;

export const hashAsync = async (password) =>
  bcrypt.hashSync(password, saltRounds);

export const isVerifyAsync = async (password, hash) =>
  bcrypt.compareSync(password, hash);

// export default { hashAsync, isVerifyAsync };
