import { CurrentUser, JsonController, Post, Req, Res, UseBefore } from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { json } from 'body-parser';
import { Request, Response } from 'express';
import { verifyCaptchaByCloudFlare } from '@base/utils/cf-turnstile';
import passport from '@api/auth/services/sign-in-with-wallet/passport';
import { STRATEGY_USER } from '@api/constant/auth';
import { AuthService } from '@api/auth/services/AuthService';
import { User } from '@api/profile/models/User';

@JsonController('/auth')
export class AuthController extends ControllerBase {
  constructor(private authService: AuthService) {
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
  @UseBefore(
    json(),
    verifyCaptchaByCloudFlare,
    passport.authenticate(STRATEGY_USER, {
      failureMessage: true,
      failWithError: true,
    })
  )
  public async loginByUser(@CurrentUser() _currentUser: User, @Req() _req: Request, @Res() _res: Response) {
    return await this.authService.prepareLoginResponse();
  }
}
