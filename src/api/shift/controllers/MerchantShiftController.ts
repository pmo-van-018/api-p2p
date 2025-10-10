import { MerchantAuthorized } from '@api/auth/services/MerchantAuthorized';
import { MERCHANT_ROLE_TYPE } from '@api/common/models';
import { Operation } from '@api/profile/models/Operation';
import { CheckInRequest } from '@api/shift/requests/CheckInRequest';
import { GetShiftHistoriesRequest } from '@api/shift/requests/GetShiftHistoriesRequest';
import { GetShiftStatusResponse } from '@api/shift/responses/GetShiftStatusResponse';
import { CheckInUseCase } from '@api/shift/usecases/CheckInUseCase';
import { CheckOutUseCase } from '@api/shift/usecases/CheckOutUseCase';
import { GetShiftStatusUseCase } from '@api/shift/usecases/GetShiftStatusUseCase';
import { MyShiftHistoriesUseCase } from '@api/shift/usecases/MyShiftHistoriesUseCase';
import { PaginationResponse, Response } from '@base/decorators/Response';
import { Body, CurrentUser, Get, JsonController, Post, QueryParams } from 'routing-controllers';
import { CheckoutRequest } from '@api/shift/requests/CheckoutRequest';
import { BaseShiftResponse } from '@api/shift/responses/BaseShiftResponse';
import { CheckOutResponse } from '@api/shift/responses/CheckOutResponse';
import { CheckInResponse } from '@api/shift/responses/CheckInResponse';

@JsonController('/shifts/merchant')
export class MerchantShiftController {
  constructor(
    private readonly getShiftStatusUseCase: GetShiftStatusUseCase,
    private readonly checkInUseCase: CheckInUseCase,
    private readonly checkOutUseCase: CheckOutUseCase,
    private readonly myShiftHistoriesUseCase: MyShiftHistoriesUseCase
  ) {}

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Get('/get-shift-status')
  @Response(GetShiftStatusResponse)
  public async getShiftStatusOfCurrentMerchant(@CurrentUser({ required: true }) currentUser: Operation) {
    return await this.getShiftStatusUseCase.getCurrentShiftStatusOfOperationId(currentUser.id);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Post('/check-in')
  @Response(CheckInResponse)
  public async checkIn(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() checkInRequest: CheckInRequest
  ) {
    return await this.checkInUseCase.checkIn(currentUser, checkInRequest);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Post('/check-out')
  @Response(CheckOutResponse)
  public async checkOut(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() checkoutRequest: CheckoutRequest
  ) {
    return await this.checkOutUseCase.checkOut(currentUser, checkoutRequest);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Get('/get-list-shift')
  @PaginationResponse(BaseShiftResponse)
  public async getMyShiftHistories(
    @CurrentUser({ required: true }) currentUser: Operation,
    @QueryParams() shiftHistoriesRequest: GetShiftHistoriesRequest
  ) {
    return await this.myShiftHistoriesUseCase.getMyShiftHistories(currentUser.id, shiftHistoriesRequest);
  }
}
