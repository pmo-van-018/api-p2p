import { createHash } from 'crypto';

export const hashMd5 = (data: any) => {
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }
  return createHash('md5').update(data).digest('hex');
};
