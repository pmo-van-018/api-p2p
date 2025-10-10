import { ADMIN_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { Operation } from '@api/profile/models/Operation';
import { PaginationResponse, Response } from '@base/decorators/Response';
import { Body, CurrentUser, Get, JsonController, Params, Post, QueryParams } from 'routing-controllers';
import { AdminAuthorized } from '@api/auth/services/AdminAuthorized';
import { ConfirmTransactionUseCase } from '@api/order/usecase/admin/ConfirmTransactionUseCase';
import { AdminSupporterConfirmTransactionRequest } from '@api/order/requests/AdminSupporterConfirmTransactionRequest';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { ListTransactionFailedUseCase } from '@api/order/usecase/admin/ListTransactionFailedUseCase';
import { GetTransactionFailedDetailUseCase } from '@api/order/usecase/admin/GetTransactionFailedDetailUseCase';
import { RefIDParamRequest } from '@api/common/requests/BaseRequest';
import { BaseOrderResponse } from '../responses/Orders/Operation/BaseOrderResponse';
import { CountTransactionConfirmationUseCase } from '@api/order/usecase/admin/CountTransactionConfirmationUseCase';
import { CountTransactionConfirmationResponse } from '../responses/Orders/Admin/CountTransactionConfirmationResponse';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';
import { OrderConfirmationInfoResponse } from '../responses/Orders/Admin/OrderConfirmationInfoResponse';

@JsonController('/order/admin')
@AdminAuthorized()
export class MerchantOrderController extends ControllerBase {
  constructor(
    private confirmTransactionUseCase: ConfirmTransactionUseCase,
    private getListTransactionFailedUseCase: ListTransactionFailedUseCase,
    private countTransactionConfirmationUseCase: CountTransactionConfirmationUseCase,
    private getTransactionFailedDetailUseCase: GetTransactionFailedDetailUseCase
  ) {
    super();
  }

  @Post('/confirm-transaction')
  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Response(EmptyResponse)
  public async confirmTransaction(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: AdminSupporterConfirmTransactionRequest
  ) {
    return await this.confirmTransactionUseCase.confirmTransaction(currentUser, body);
  }

  @Get('/get-failed-transactions')
  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @PaginationResponse(OrderConfirmationInfoResponse)
  public async getList(@CurrentUser({ required: true }) currentUser: Operation, @QueryParams() request: PaginationQueryRequest) {
    return await this.getListTransactionFailedUseCase.getList(currentUser, request);
  }

  @Get('/count-failed-transactions')
  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Response(CountTransactionConfirmationResponse)
  public async countTransaction(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.countTransactionConfirmationUseCase.countTransaction(currentUser);
  }

  @Get('/get-transaction-detail/:id')
  @AdminAuthorized([ADMIN_ROLE_TYPE.ADMIN_SUPPORTER])
  @Response(BaseOrderResponse)
  public async getDetail(@CurrentUser({ required: true }) currentUser: Operation, @Params() params: RefIDParamRequest) {
    return await this.getTransactionFailedDetailUseCase.getDetail(currentUser, params.id);
  }
}
