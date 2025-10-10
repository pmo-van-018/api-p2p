import { Body, CurrentUser, JsonController, Post, Req, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import passport from '@api/auth/services/sign-in-with-wallet/passport';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { json } from 'body-parser';
import { verifyCaptchaByCloudFlare } from '@base/utils/cf-turnstile';
import { STRATEGY_ADMIN } from '@api/constant/auth';
import { Operation } from '@api/profile/models/Operation';
import { AuthAdminService } from '@api/auth/services/AuthAdminService';
import { TwoFactorAuth } from '@api/auth/models/TwoFactorAuth';
import { TwoFactorAuthStatus } from '@api/auth/enums/TwoFactorAuth';
import { AdminAuthorized } from '../services/AdminAuthorized';
import { VerifyOTPAttemptMiddleware } from '@api/middlewares/local/VerifyOTPAttemptMiddleware';
import { Verify2FARequest } from '../requests/Verify2FARequest';
import { HttpResponseError } from '@api/common/errors';
import { Response } from '@base/decorators/Response';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { Generate2FASecretResponse } from '../responses/Generate2FASecretResponse';
import { Register2FAResponse } from '../responses/Register2FAResponse';
import { Register2FARequest } from '../requests/Register2FARequest';
import { Unregister2FAResponse } from '../responses/Unregister2FAResponse';
import { Unregister2FARequest } from '../requests/Unregister2FARequest';
import { UserPassword } from '@api/profile/models/UserPassword';
import { AuthUserPasswordService } from '../services/AuthUserPasswordService';
import { ChangePasswordRequest } from '../requests/ChangePasswordRequest';

@JsonController('/auth/admin')
export class AuthAdminController extends ControllerBase {
  constructor(private authService: AuthAdminService, private authUserPassword: AuthUserPasswordService) {
    super();
  }

  @Post('/login/challenge')
  public async challengeLogin(@Req() request: any) {
    return await new Promise((resolve) => {
      this.authService.getSessionNonceStore().challenge(request, (err, nonce) => {
        resolve({ nonce });
      });
    });
  }

  @Post('/login')
  @OpenAPI({
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              signature: { type: 'string' },
              loginType: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @UseBefore(
    json(),
    verifyCaptchaByCloudFlare,
    passport.authenticate(STRATEGY_ADMIN, {
      failureMessage: true,
      failWithError: true,
    })
  )
  public async loginByAdmin(@CurrentUser() currentUser: Operation) {
    return {
      success: true,
      twoFactorAuth: {
        totpStatus: (currentUser['twoFactorAuth'] as TwoFactorAuth)?.totpStatus ?? TwoFactorAuthStatus.DISABLED,
        verified: !!currentUser['twoFactorAuth']?.['verified'],
      },
    };
  }

  @Post('/login-2fa')
  @AdminAuthorized(null, { skipRequire2FA: true, middlewares: [VerifyOTPAttemptMiddleware] })
  @Response(EmptyResponse)
  public async login2FAByAdmin(@CurrentUser() currentUser: Operation, @Req() req: any, @Body() body: Verify2FARequest) {
    const alreadyVerified2FA =
      (currentUser['twoFactorAuth'] as TwoFactorAuth)?.totpStatus === TwoFactorAuthStatus.ENABLED &&
      currentUser['twoFactorAuth']?.['verified'] === true;
    if (alreadyVerified2FA) {
      return HttpResponseError.ALREADY_VERIFIED_2FA;
    }

    const { success, twoFactorAuth } = await this.authService.login2FA(currentUser, body);
    if (!success) {
      return HttpResponseError.VALIDATE_2FA_FAILED;
    }

    req.session.passport.user = {
      ...currentUser,
      twoFactorAuth: {
        ...twoFactorAuth,
        verified: true,
      },
    };

    return null;
  }

  @OpenAPI({
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              password: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @UseBefore(
    json(),
    passport.authenticate('local', {
      failureMessage: true,
      failWithError: true,
    })
  )
  @Post('/login-password')
  public async loginPassword(@CurrentUser() currentUser: UserPassword) {
    return {
      success: true,
    };
  }

  @Post('/change-password')
  public async changePassword(
    @CurrentUser({ required: true }) currentUser: UserPassword,
    @Body() request: ChangePasswordRequest
  ) {
    await this.authUserPassword.changePassword(currentUser, request);
    return {
      success: true,
    };
  }

  @Post('/generate-2fa-secret')
  @AdminAuthorized()
  @Response(Generate2FASecretResponse)
  public async generate2FASecret(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.authService.generate2FASecret(currentUser);
  }

  @Post('/register-2fa')
  @AdminAuthorized(null, { middlewares: [VerifyOTPAttemptMiddleware] })
  @Response(Register2FAResponse)
  public async register2FA(@CurrentUser({ required: true }) currentUser: Operation, @Body() body: Register2FARequest) {
    return await this.authService.register2FA(currentUser, body);
  }

  @Post('/unregister-2fa')
  @AdminAuthorized(null, { middlewares: [VerifyOTPAttemptMiddleware] })
  @Response(Unregister2FAResponse)
  public async unregister2FA(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: Unregister2FARequest
  ) {
    return await this.authService.unregister2FA(currentUser, body);
  }
}
