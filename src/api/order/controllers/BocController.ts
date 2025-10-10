import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Body, JsonController, Post } from 'routing-controllers';
import { UpdatePaymentTicketUseCase } from '../usecase/boc/UpdatePaymentTicketUseCase';
import { Response } from '@base/decorators/Response';
import { SuccessStatusResponse } from '@api/common/responses/SuccessStatusResponse';
import { BocRequestBodyDto } from '../requests/BocUpdateTicketRequest';
import { BOCAuthorized } from '@api/auth/services/BOCAuthorized';

@JsonController('/order/boc')
@BOCAuthorized()
export class BOCController extends ControllerBase {
  constructor(
    private updatePaymentTicketUseCase: UpdatePaymentTicketUseCase,
  ) {
    super();
  }

  @Post('/update-ticket')
  @Response(SuccessStatusResponse)
  public async updatePaymentTicket(@Body() body: BocRequestBodyDto) {
    return await this.updatePaymentTicketUseCase.updatePaymentTicket(body);
  }
}
