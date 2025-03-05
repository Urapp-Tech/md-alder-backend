import { createHash } from 'node:crypto';

function getSha256Hash(data) {
  return createHash('sha256').update(data).digest('hex');
}

export default getSha256Hash;
