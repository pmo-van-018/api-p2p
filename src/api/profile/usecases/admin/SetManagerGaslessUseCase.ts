import {Service} from 'typedi';
import {Logger, LoggerInterface} from '@base/decorators/Logger';
import {SetGaslessRequest} from '@api/profile/requests/SetGaslessRequest';
import {OperationError} from '@api/errors/OperationError';
import {events} from '@api/subscribers/events';
import {AdminProfileService} from '@api/profile/services/AdminProfileService';
import {OperationType} from '@api/common/models';
import {EventDispatcher, EventDispatcherInterface} from '@base/decorators/EventDispatcher';

@Service()
export class SetManagerGaslessUseCase {
  constructor(
    private adminProfileService: AdminProfileService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async setGasless(managerId: string, body: SetGaslessRequest) {
    this.log.debug(`Start implement setGasless: ${managerId} with params: ${JSON.stringify(body)}`);
    const merchantManager = await this.adminProfileService.findOneById(managerId, OperationType.MERCHANT_MANAGER);
    if (!merchantManager) {
      return OperationError.MERCHANT_NOT_FOUND;
    }
    await this.adminProfileService.setManagerGasless(managerId, {
      allowGasless: body.allowGasless,
      gaslessTransLimit: body.gaslessTransLimit,
    });
    this.eventDispatcher.dispatch(events.actions.admin.onSettingManagerGasless,
      {
        ...body,
        managerId,
      }
    );
    this.log.debug(`Stop implement setGasless: ${managerId} with params: ${JSON.stringify(body)}`);
    return null;
  }
}
