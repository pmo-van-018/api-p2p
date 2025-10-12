import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Body, JsonController, Post } from 'routing-controllers';
import { UpdatePaymentTicketUseCase } from '../usecase/boc/UpdatePaymentTicketUseCase';
import { Response } from '@base/decorators/Response';
import { SuccessStatusResponse } from '@api/common/responses/SuccessStatusResponse';
import { NotifyTicketHandlerRequest } from '../requests/BocNotifyTicketHandlerRequest';
import { UpdateTicketRequest } from '../requests/BocUpdateTicketRequest';
import { BOCAuthorized } from '@api/auth/services/BOCAuthorized';
import { NotifyPaymentTicketHandlerUseCase } from '../usecase/boc/NotifyPaymentTicketHandlerUseCase';

@JsonController('/order/boc')
@BOCAuthorized()
export class BOCController extends ControllerBase {
  constructor(
    private updatePaymentTicketUseCase: UpdatePaymentTicketUseCase,
    private notifyPaymentTicketHandlerUseCase: NotifyPaymentTicketHandlerUseCase,
  ) {
    super();
  }

  @Post('/completed-ticket')
  @Response(SuccessStatusResponse)
  public async updatePaymentTicket(@Body() body: UpdateTicketRequest) {
    return await this.updatePaymentTicketUseCase.updatePaymentTicket(body);
  }

  @Post('/update-processing-ticket')
  @Response(SuccessStatusResponse)
  public async notifyTicketHandler(@Body() body: NotifyTicketHandlerRequest) {
    return await this.notifyPaymentTicketHandlerUseCase.notifyPaymentTicketHandler(body);
  }
}
