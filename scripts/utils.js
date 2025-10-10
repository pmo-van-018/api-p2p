const { scrypt, randomBytes } = require('crypto');

const keyLength = 32;

const hash = async (password) => {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString('hex');

    scrypt(password, salt, keyLength, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}.${derivedKey.toString('hex')}`);
    });
  });
};

module.exports = {
  hash
}
