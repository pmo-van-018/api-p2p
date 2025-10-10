import { Authorized, JsonController, Post, Req } from 'routing-controllers';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Logger, LoggerInterface } from '@base/decorators/Logger';

@JsonController('/auth')
export class AuthController extends ControllerBase {
  constructor(@Logger(__filename) private log: LoggerInterface) {
    super();
  }

  @Post('/logout')
  @Authorized()
  public async logout(@Req() request: any) {
    if (request.session) {
      request.logout((error) => {
        if (error) {
          this.log.error(error.name, error.stack);
        }
      });
    }
    return { success: true };
  }
}
