import { scrypt, randomBytes, timingSafeEqual } from 'crypto';

const keyLength = 32;

export const hash = async (password: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const salt = randomBytes(16).toString('hex');

    scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      return resolve(`${salt}.${derivedKey.toString('hex')}`);
    });
  });
};

export const compare = async (password: string, hashedPassword: string): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    const [salt, hashKey] = hashedPassword.split('.');
    const hashKeyBuff = Buffer.from(hashKey, 'hex');
    scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      return resolve(timingSafeEqual(hashKeyBuff, derivedKey));
    });
  });
};
