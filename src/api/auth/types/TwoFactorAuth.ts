export interface TwoFactorAuthIdentity {
  userId: string;
  username: string;
}

export interface TwoFactorAuthSecret {
  qrCodeUrl: string;
  secretKey: string;
}
