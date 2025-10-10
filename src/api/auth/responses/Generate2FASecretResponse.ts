import { TwoFactorAuthSecret } from '@api/auth/types/TwoFactorAuth';

export class Generate2FASecretResponse {
  public qrCodeUrl: string;
  public secretKey: string;

  constructor(secret: TwoFactorAuthSecret) {
    this.qrCodeUrl = secret.qrCodeUrl;
    this.secretKey = secret.secretKey;
  }
}
