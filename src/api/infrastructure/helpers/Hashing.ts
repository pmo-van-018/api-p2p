import crypto from 'crypto';

export class Hashing {
  public static generateCode(algorithm: string, message: string, length: number = 10): string {
    const codeEncrypted = this.getEncryptWithAlgorithm('sha1', message);
    return codeEncrypted.substring(0, length).toUpperCase();
  }
  public static getEncryptWithAlgorithm(algorithm: string, message: string): string {
    const randomHex = crypto.randomBytes(20).toString('hex');
    return crypto.createHash(algorithm).update(`${randomHex}${message}`).digest('hex');
  }
}
