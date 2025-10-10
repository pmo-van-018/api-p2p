import { Verify2FARequest } from '@api/auth/requests/Verify2FARequest';

export interface IVerify2FA {
  /**
   * Verify TOTP in current request.
   *
   * @currentUser { Operation | User }
   */
  verify2FA(currentUser: any, request: Verify2FARequest): Promise<{ success: boolean }>;
}
