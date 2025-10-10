import { Body, CurrentUser, JsonController, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import passport from '@api/auth/services/sign-in-with-wallet/passport';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { json } from 'body-parser';
import { Request } from 'express';
import { verifyCaptchaByCloudFlare } from '@base/utils/cf-turnstile';
import { STRATEGY_MERCHANT } from '@api/constant/auth';
import { Operation } from '@api/profile/models/Operation';
import { AuthMerchantService } from '@api/auth/services/AuthMerchantService';
import { Register2FARequest } from '../requests/Register2FARequest';
import { Response } from '@base/decorators/Response';
import { Generate2FASecretResponse } from '../responses/Generate2FASecretResponse';
import { Verify2FARequest } from '../requests/Verify2FARequest';
import { MerchantAuthorized } from '../services/MerchantAuthorized';
import { Unregister2FARequest } from '../requests/Unregister2FARequest';
import { TwoFactorAuth } from '@api/auth/models/TwoFactorAuth';
import { TwoFactorAuthStatus } from '@api/auth/enums/TwoFactorAuth';
import { Register2FAResponse } from '../responses/Register2FAResponse';
import { Unregister2FAResponse } from '../responses/Unregister2FAResponse';
import { VerifyOTPAttemptMiddleware } from '@api/middlewares/local/VerifyOTPAttemptMiddleware';
import { HttpResponseError } from '@api/common/errors';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';

@JsonController('/auth/merchant')
export class AuthMerchantController extends ControllerBase {
  constructor(private authService: AuthMerchantService) {
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
    passport.authenticate(STRATEGY_MERCHANT, {
      failureMessage: true,
      failWithError: true,
    })
  )
  public async loginByMerchant(@CurrentUser() currentUser: Operation, @Req() _req: Request, @Res() _res: Response) {
    return {
      success: true,
      twoFactorAuth: {
        totpStatus: (currentUser['twoFactorAuth'] as TwoFactorAuth)?.totpStatus ?? TwoFactorAuthStatus.DISABLED,
        verified: !!currentUser['twoFactorAuth']?.['verified'],
      },
    };
  }

  @Post('/login-2fa')
  @MerchantAuthorized(null, { skipRequire2FA: true, middlewares: [VerifyOTPAttemptMiddleware] })
  @Response(EmptyResponse)
  public async login2FAByMerchant(
    @CurrentUser() currentUser: Operation,
    @Req() req: any,
    @Body() body: Verify2FARequest
  ) {
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

  @Post('/generate-2fa-secret')
  @MerchantAuthorized()
  @Response(Generate2FASecretResponse)
  public async generate2FASecret(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.authService.generate2FASecret(currentUser);
  }

  @Post('/register-2fa')
  @MerchantAuthorized(null, { middlewares: [VerifyOTPAttemptMiddleware] })
  @Response(Register2FAResponse)
  public async register2FA(@CurrentUser({ required: true }) currentUser: Operation, @Body() body: Register2FARequest) {
    return await this.authService.register2FA(currentUser, body);
  }

  @Post('/unregister-2fa')
  @MerchantAuthorized(null, { middlewares: [VerifyOTPAttemptMiddleware] })
  @Response(Unregister2FAResponse)
  public async unregister2FA(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: Unregister2FARequest
  ) {
    return await this.authService.unregister2FA(currentUser, body);
  }
}
