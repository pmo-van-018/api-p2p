import { User } from '@api/profile/models/User';
import { PaymentMethodCreateRequest } from '@api/payment/requests/PaymentMethodCreateRequest';
import { PaymentMethodUpdateRequest } from '@api/payment/requests/PaymentMethodUpdateRequest';
import { ControllerBase } from '@api/infrastructure/abstracts/ControllerBase';
import { PaginationResponse, Response } from '@base/decorators/Response';
import {
  Body,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Params,
  Post,
  Put,
  QueryParams,
} from 'routing-controllers';
import { UUIDParamRequest } from '@api/common/requests/BaseRequest';
import { UserAuthorized } from '@api/auth/services/UserAuthorized';
import { CreatePaymentMethodByUserUseCase } from '@api/payment/usecase/CreatePaymentMethodByUserUseCase';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { UpdatePaymentMethodByUserUseCase } from '@api/payment/usecase/UpdatePaymentMethodByUserUseCase';
import { ListPaymentMethodByUserUseCase } from '@api/payment/usecase/ListPaymentMethodByUserUseCase';
import { DeletePaymentMethodByUserUseCase } from '@api/payment/usecase/DeletePaymentMethodByUserUseCase';
import { CreatedResponse } from '@api/common/responses/CreatedResponse';
import { PaymentMethodListResponse, UserPaymentMethodListResponse } from '@api/payment/responses/PaymentMethodListResponse';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';

@JsonController('/payments')
@UserAuthorized()
export class UserPaymentsController extends ControllerBase {
  constructor(
    private createPaymentMethodByUserUseCase: CreatePaymentMethodByUserUseCase,
    private updatePaymentMethodByUserUseCase: UpdatePaymentMethodByUserUseCase,
    private listPaymentMethodUseCase: ListPaymentMethodByUserUseCase,
    private deletePaymentMethodByUserUseCase: DeletePaymentMethodByUserUseCase
  ) {
    super();
  }

  @Post('/create-payment-method')
  @Response(CreatedResponse)
  public async createPaymentMethod(
    @CurrentUser({ required: true }) currentUser: User,
    @Body() paymentMethodCreateRequest: PaymentMethodCreateRequest
  ) {
    return await this.createPaymentMethodByUserUseCase.createPaymentMethod(currentUser, paymentMethodCreateRequest);
  }

  @Put('/update-payment-method')
  @Response(EmptyResponse)
  public async updatePaymentMethod(
    @CurrentUser({ required: true }) currentUser: User,
    @Body() paymentMethodUpdateRequest: PaymentMethodUpdateRequest
  ) {
    return await this.updatePaymentMethodByUserUseCase.updatePaymentMethod(currentUser, paymentMethodUpdateRequest);
  }

  @Get('/list-payment-methods')
  @PaginationResponse(UserPaymentMethodListResponse)
  public async listPaymentMethod(
    @CurrentUser({ required: true }) currentUser: User
  ) {
    return await this.listPaymentMethodUseCase.listPaymentMethod(currentUser);
  }

  @Get('/list-public-payment-methods')
  @PaginationResponse(PaymentMethodListResponse)
  public async listPublicPaymentMethod(
    @CurrentUser({ required: true }) currentUser: User,
    @QueryParams() pagination: PaginationQueryRequest
  ) {
    return await this.listPaymentMethodUseCase.listPaymentMethod(currentUser, pagination);
  }

  @Delete('/delete-payment-method/:id')
  @Response(EmptyResponse)
  public async deletePaymentMethod(@Params() params: UUIDParamRequest, @CurrentUser({ required: true }) currentUser: User) {
    return await this.deletePaymentMethodByUserUseCase.deletePaymentMethod(currentUser, params.id);
  }
}
