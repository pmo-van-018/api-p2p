import { MERCHANT_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { Operation } from '@api/profile/models/Operation';
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
import { CreatePaymentMethodByMerchantUseCase } from '@api/payment/usecase/CreatePaymentMethodByMerchantUseCase';
import { EmptyResponse } from '@api/common/responses/EmptyResponse';
import { MerchantAuthorized } from '@api/auth/services/MerchantAuthorized';
import { UpdatePaymentMethodByMerchantUseCase } from '@api/payment/usecase/UpdatePaymentMethodByMerchantUseCase';
import { ListPaymentMethodByMerchantUseCase } from '@api/payment/usecase/ListPaymentMethodByMerchantUseCase';
import { DeletePaymentMethodByMerchantUseCase } from '@api/payment/usecase/DeletePaymentMethodByMerchantUseCase';
import { CreatedResponse } from '@api/common/responses/CreatedResponse';
import { PaymentMethodListResponse } from '@api/payment/responses/PaymentMethodListResponse';
import { GetPaymentMethodAvailabilityUseCase } from '@api/payment/usecase/GetPaymentMethodAvailabilityUseCase';
import { GetPaymentMethodAvailabilityResponse } from '@api/payment/responses/GetPaymentMethodAvailabilityResponse';
import { PaginationQueryRequest } from '@api/common/requests/PaginationQueryRequest';

@JsonController('/payments/merchant')
export class MerchantPaymentsController extends ControllerBase {
  constructor(
    private createPaymentMethodByMerchantUseCase: CreatePaymentMethodByMerchantUseCase,
    private updatePaymentMethodByMerchantUseCase: UpdatePaymentMethodByMerchantUseCase,
    private listPaymentMethodByMerchantUseCase: ListPaymentMethodByMerchantUseCase,
    private deletePaymentMethodByMerchantUseCase: DeletePaymentMethodByMerchantUseCase,
    private getPaymentMethodAvailabilityUseCase: GetPaymentMethodAvailabilityUseCase
  ) {
    super();
  }

  @Post('/create-payment-method')
  @Response(CreatedResponse)
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  public async createPaymentMethod(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() paymentMethodCreateRequest: PaymentMethodCreateRequest
  ) {
    return await this.createPaymentMethodByMerchantUseCase.createPaymentMethod(currentUser, paymentMethodCreateRequest);
  }

  @Put('/update-payment-method')
  @Response(EmptyResponse)
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  public async updatePaymentMethod(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() paymentMethodUpdateRequest: PaymentMethodUpdateRequest
  ) {
    return await this.updatePaymentMethodByMerchantUseCase.updatePaymentMethod(currentUser, paymentMethodUpdateRequest);
  }

  @Get('/list-payment-methods')
  @PaginationResponse(PaymentMethodListResponse)
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER, MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  public async listPaymentMethod(
    @CurrentUser({ required: true }) currentUser: Operation,
    @QueryParams() pagination: PaginationQueryRequest
  ) {
    return await this.listPaymentMethodByMerchantUseCase.listPaymentMethod(currentUser, pagination);
  }

  @Delete('/delete-payment-method/:id')
  @Response(EmptyResponse)
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  public async deletePaymentMethod(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return await this.deletePaymentMethodByMerchantUseCase.deletePaymentMethod(currentUser, params.id);
  }

  @Get('/get-payment-method-availability/:id')
  @Response(GetPaymentMethodAvailabilityResponse)
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  public async getPaymentMethodAvailability(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: UUIDParamRequest
  ) {
    return await this.getPaymentMethodAvailabilityUseCase.getPaymentMethodAvailability(currentUser, params.id);
  }
}
