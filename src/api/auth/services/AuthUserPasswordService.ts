import { UserError } from '@api/profile/errors/UserError';
import { SessionNonceStore } from '@base/utils/nonce-session.util';
import { Service } from 'typedi';
import { BaseAuthService } from '@api/auth/services/BaseAuthService';
import { env } from '@base/env';
import { SessionUtil } from '@base/utils/session.util';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { UserPasswordRepository } from '@api/profile/repositories/UserPasswordRepository';
import { P2PError } from '@api/common/errors/P2PError';
import { compare, hash } from '@base/utils/crypto';
import { UserPassword } from '@api/profile/models/UserPassword';
import LocalStrategy from 'passport-local';
import { ChangePasswordRequest } from '../requests/ChangePasswordRequest';
import { ROLE_REPORTER } from '@api/constant/auth';

@Service()
export class AuthUserPasswordService extends BaseAuthService {
  constructor(@InjectRepository() private userPasswordRepository: UserPasswordRepository) {
    super(env.app.operationSessionExpire);
    this.initSessionStore();
  }

  public strategyP2PAuthentication(store: SessionNonceStore) {
    return new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, username, password, cb): Promise<any> => {
        const existsUser = await this.userPasswordRepository.findOne({ username: username });
        if (!existsUser) {
          return cb(new P2PError(UserError.USERNAME_OR_PASSWOR_IS_INCORRECT), null);
        }

        const checkPw = await compare(password, existsUser.password);
        if (!checkPw) {
          return cb(new P2PError(UserError.USERNAME_OR_PASSWOR_IS_INCORRECT), null);
        }

        delete existsUser.password;

        return cb(null, {
          ...existsUser,
          type: ROLE_REPORTER,
        });
      }
    );
  }

  public async changePassword(currentUser: UserPassword, request: ChangePasswordRequest): Promise<void> {
    const existsUser = await this.userPasswordRepository.findOne({ username: currentUser.username });
    if (!existsUser) {
      throw new P2PError(UserError.USERNAME_OR_PASSWOR_IS_INCORRECT);
    }

    const checkPw = await compare(request.currentPassword, existsUser.password);
    if (!checkPw) {
      throw new P2PError(UserError.USERNAME_OR_PASSWOR_IS_INCORRECT);
    }

    existsUser.password = await hash(request.newPassword);

    await this.userPasswordRepository.save(existsUser);

    await SessionUtil.destroy(currentUser.id);
  }

  protected initSessionMiddleware() {
    this.sessionMiddleware = SessionUtil.getSessionReporterStore();
  }
}
