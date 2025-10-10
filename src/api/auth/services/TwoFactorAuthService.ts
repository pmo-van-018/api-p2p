import { Service } from 'typedi';
import { TypeORMError } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { AuthenticatorAsync, KeyDecoder, KeyEncoder } from '@otplib/core-async';
import { createDigest, createRandomBytes } from '@otplib/plugin-crypto-async-ronomon';
import { keyDecoder, keyEncoder } from '@otplib/plugin-thirty-two';

import { env } from '@base/env';
import { setCache } from '@base/utils/redis-client';
import { TwoFactorAuthRepository } from '../repositories/TwoFactorAuthRepository';
import { TwoFactorAuthIdentity, TwoFactorAuthSecret } from '../types/TwoFactorAuth';
import { TwoFactorAuthStatus } from '../enums/TwoFactorAuth';
import { TwoFactorAuth } from '../models/TwoFactorAuth';

@Service()
export class TwoFactorAuthService {
  protected authenticator: AuthenticatorAsync;
  protected serviceName: string;

  constructor(@InjectRepository() protected twoFactorAuthRepository: TwoFactorAuthRepository) {
    this.authenticator = new AuthenticatorAsync({
      createDigest,
      createRandomBytes,
      keyDecoder: keyDecoder as unknown as KeyDecoder<Promise<string>>,
      keyEncoder: keyEncoder as unknown as KeyEncoder<Promise<string>>,
    });
    this.serviceName = env.app.name;
  }

  public async findOneByUserId(userId: string): Promise<TwoFactorAuth> {
    return await this.twoFactorAuthRepository.findOne({
      ...this.getIdentityCondition(userId),
    });
  }

  public async generateSecret(identity: TwoFactorAuthIdentity, serviceName?: string): Promise<TwoFactorAuthSecret> {
    const get2FASecret = async () => {
      const twoFactorAuth = await this.findOneByUserId(identity.userId);
      if (twoFactorAuth && twoFactorAuth.totpSecret && twoFactorAuth.totpSecret !== '') {
        const qrCodeUrl = await this._generateQrCodeUrl(identity.username, twoFactorAuth.totpSecret, serviceName);
        return {
          qrCodeUrl,
          secretKey: twoFactorAuth.totpSecret,
        };
      }
      return null;
    };

    let twoFactorAuthSecret = await get2FASecret();
    if (twoFactorAuthSecret) {
      return twoFactorAuthSecret;
    }

    const secret = await this._generateSecret(identity.username, serviceName);
    const new2FA = this.twoFactorAuthRepository.merge(this.twoFactorAuthRepository.create(), {
      ...this.getIdentityCondition(identity.userId),
      id: identity.userId,
      totpSecret: secret.secretKey,
      totpStatus: TwoFactorAuthStatus.UNAUTHORIZED,
    });

    try {
      await this.twoFactorAuthRepository.insert(new2FA);
    } catch (err: any) {
      const errDupl = err instanceof TypeORMError && (err['errno'] === 1062 || err['code'] === 'ER_DUP_ENTRY');
      if (errDupl) {
        twoFactorAuthSecret = await get2FASecret();
        if (twoFactorAuthSecret) {
          return twoFactorAuthSecret;
        }
      }
      throw err;
    }

    return secret;
  }

  public async register(
    twoFactorAuth: string | TwoFactorAuth
  ): Promise<{ success: boolean; twoFactorAuth?: TwoFactorAuth }> {
    let local2FA = twoFactorAuth;
    if (typeof local2FA === 'string') {
      local2FA = await this.findOneByUserId(local2FA);
    }

    if (!local2FA || !local2FA.totpSecret || local2FA.totpSecret === '') {
      return { success: false };
    }

    local2FA.totpStatus = TwoFactorAuthStatus.ENABLED;
    await this.twoFactorAuthRepository.update(local2FA.id, local2FA);

    return { success: true, twoFactorAuth: local2FA };
  }

  public async unregister(
    twoFactorAuth: string | TwoFactorAuth
  ): Promise<{ success: boolean; twoFactorAuth?: TwoFactorAuth }> {
    let local2FA = twoFactorAuth;
    if (typeof local2FA === 'string') {
      local2FA = await this.findOneByUserId(local2FA);
    }

    if (!local2FA || !local2FA.isEnabled2FA()) {
      return { success: false };
    }

    local2FA.totpStatus = TwoFactorAuthStatus.DISABLED;
    await this.twoFactorAuthRepository.update(local2FA.id, local2FA);

    return { success: true, twoFactorAuth: local2FA };
  }

  public async verify(userId: string, token: string): Promise<{ success: boolean }> {
    const twoFactorAuth = await this.findOneByUserId(userId);

    // check whether the 2fa is valid or not
    const isValid2FA = twoFactorAuth && twoFactorAuth.isValid2FA();
    if (!isValid2FA) {
      return { success: false };
    }

    return { success: !!(await this.check(token, twoFactorAuth.totpSecret)) };
  }

  public async check(token: string, secret: string): Promise<boolean> {
    return await this.authenticator.check(token, secret);
  }

  public async check2FAIsEnabled(twoFactorAuth: string | TwoFactorAuth): Promise<boolean> {
    if (typeof twoFactorAuth === 'string') {
      twoFactorAuth = await this.findOneByUserId(twoFactorAuth);
    }

    if (twoFactorAuth) {
      await setCache(this.build2FACacheKey(this.getIdentity(twoFactorAuth)), twoFactorAuth.totpStatus);
    }

    return twoFactorAuth && twoFactorAuth.isEnabled2FA();
  }

  protected async _generateSecret(username: string, serviceName?: string): Promise<TwoFactorAuthSecret> {
    const secretKey = await this.authenticator.generateSecret();
    const qrCodeUrl = await this._generateQrCodeUrl(username, secretKey, serviceName);
    return {
      secretKey,
      qrCodeUrl,
    };
  }

  protected async _generateQrCodeUrl(username: string, secretKey: string, serviceName?: string): Promise<string> {
    serviceName = serviceName ? serviceName : this.serviceName;
    return await this.authenticator.keyuri(username, serviceName, secretKey);
  }

  protected getIdentityCondition(
    twoFactorAuth: string | TwoFactorAuth
  ): Partial<Pick<TwoFactorAuth, 'operationId' | 'userId'>> {
    return {
      userId: this.getIdentity(twoFactorAuth),
    };
  }

  protected getIdentity(twoFactorAuth: string | TwoFactorAuth): string {
    return typeof twoFactorAuth === 'string' ? twoFactorAuth : twoFactorAuth.userId;
  }

  protected build2FACacheKey(userId: string): string {
    return `2fa:${userId}:status`;
  }
}
