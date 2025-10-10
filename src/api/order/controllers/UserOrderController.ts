import {ControllerBase} from '@api/infrastructure/abstracts/ControllerBase';
import {UseLimitMiddleware} from '@api/middlewares/local/LimitMiddleware';
import {OrderCreateRequest} from '@api/order/requests/OrderCreateRequest';
import {OrderSellCreateRequest} from '@api/order/requests/OrderSellCreateRequest';
import {CryptoTransactionResponse} from '@api/order/responses/Orders';
import {User} from '@api/profile/models/User';
import {PaginationResponse, Response} from '@base/decorators/Response';
import {verifyCaptchaByCloudFlare} from '@base/utils/cf-turnstile';
import {json} from 'body-parser';
import {Body, CurrentUser, Get, JsonController, Params, Post, Put, QueryParams, UseBefore} from 'routing-controllers';
import {RefIDParamRequest} from '@api/common/requests/BaseRequest';
import {
  UserCreateAppealResponse,
  UserOrderInfoBaseResponse,
  UserOrderListDetailResponse,
} from '@api/order/responses/Orders/User';
import {UserAuthorized} from '@api/auth/services/UserAuthorized';
import {CreateSellOrderUseCase} from '@api/order/usecase/user/CreateSellOrderUseCase';
import {CreatedResponse} from '@api/common/responses/CreatedResponse';
import {GetOrderDetailUseCase} from '@api/order/usecase/user/GetOrderDetailUseCase';
import {EmptyResponse} from '@api/common/responses/EmptyResponse';
import {CancelSellOrderUseCase} from '@api/order/usecase/user/CancelSellOrderUseCase';
import {ConfirmFiatReceivedUseCase} from '@api/order/usecase/user/ConfirmFiatReceivedUseCase';
import {SubmitCryptoTransactionUseCase} from '@api/order/usecase/user/SubmitCryptoTransactionUseCase';
import {SubmitCryptoTransactionRequest} from '@api/order/requests/SubmitCryptoTransactionRequest';
import {ContactMerchantOrderUseCase} from '@api/order/usecase/user/ContactMerchantOrderUseCase';
import {CreateBuyOrderUseCase} from '@api/order/usecase/user/CreateBuyOrderUseCase';
import {TradeType} from '@api/common/models';
import {ConfirmFiatSentUseCase} from '@api/order/usecase/user/ConfirmFiatSentUseCase';
import {CancelBuyOrderUseCase} from '@api/order/usecase/user/CancelBuyOrderUseCase';
import {UserGetListOrderRequest} from '@api/order/requests/UserGetListOrderRequest';
import {GetListOrderUseCase} from '@api/order/usecase/user/GetListOrderUseCase';
import { RequestTransactionConfirmationUseCase } from '@api/order/usecase/user/RequestTransactionConfirmationUseCase';
import { UserRequestConfirmationResponse } from '../responses/Orders/User/UserRequestConfirmationResponse';

@JsonController('/order')
@UserAuthorized()
export class UserOrderController extends ControllerBase {
  constructor(
    private contactMerchantOrderUseCase: ContactMerchantOrderUseCase,
    private getListOrderUseCase: GetListOrderUseCase,
    // Buy order
    private createBuyOrderUseCase: CreateBuyOrderUseCase,
    private confirmFiatSentUseCase: ConfirmFiatSentUseCase,
    private cancelBuyOrderUseCase: CancelBuyOrderUseCase,
    // Sell order
    private createSellOrderUseCase: CreateSellOrderUseCase,
    private getSellOrderDetailUseCase: GetOrderDetailUseCase,
    private cancelSellOrderUseCase: CancelSellOrderUseCase,
    private confirmFiatReceivedUseCase: ConfirmFiatReceivedUseCase,
    private submitCryptoTransactionUseCase: SubmitCryptoTransactionUseCase,
    private requestTransactionConfirmationUseCase: RequestTransactionConfirmationUseCase
  ) {
    super();
  }

  @Get('/list-orders')
  @PaginationResponse(UserOrderListDetailResponse)
  public async getOrderList(
    @CurrentUser({ required: true }) currentUser: User,
    @QueryParams() orderListRequest: UserGetListOrderRequest
  ) {
    return await this.getListOrderUseCase.getOrders(currentUser, orderListRequest);
  }

  @UseLimitMiddleware()
  @Post('/create-buy-order')
  @Response(CreatedResponse)
  public async buyCrypto(@CurrentUser({ required: true }) currentUser: User, @Body() orderRequest: OrderCreateRequest) {
    return await this.createBuyOrderUseCase.createOrder(currentUser, orderRequest);
  }

  @Get('/get-buy-order-detail/:id')
  @Response(UserOrderInfoBaseResponse)
  public async showBuyOrderInfo(
    @CurrentUser({ required: true }) currentUser: User,
    @Params() params: RefIDParamRequest
  ) {
    return await this.getSellOrderDetailUseCase.getOrderDetail(currentUser, params.id, TradeType.BUY);
  }

  @UseLimitMiddleware()
  @Put('/confirm-payment')
  @Response(EmptyResponse)
  public async confirmPayment(@CurrentUser({ required: true }) currentUser: User, @Body() orderRequest: RefIDParamRequest) {
    return await this.confirmFiatSentUseCase.confirmSent(currentUser, orderRequest.id);
  }

  @UseLimitMiddleware()
  @Put('/cancel-buy-order')
  @UseBefore(json(), verifyCaptchaByCloudFlare)
  @Response(EmptyResponse)
  public async cancelBuyOrder(@CurrentUser({ required: true }) currentUser: User, @Body() orderRequest: RefIDParamRequest) {
    return await this.cancelBuyOrderUseCase.cancelOrder(currentUser, orderRequest.id);
  }

  @UseLimitMiddleware()
  @Post('/contact-merchant-buy-order')
  @Response(UserCreateAppealResponse)
  public async appealBuyOrder(@CurrentUser({ required: true }) currentUser: User, @Body() params: RefIDParamRequest) {
    return await this.contactMerchantOrderUseCase.contact(currentUser, params.id, TradeType.BUY);
  }

  @UseLimitMiddleware()
  @Post('/create-sell-order')
  @Response(CreatedResponse)
  public async sellCrypto(
    @CurrentUser({ required: true }) currentUser: User,
    @Body() orderRequest: OrderSellCreateRequest
  ) {
    return await this.createSellOrderUseCase.createOrder(currentUser, orderRequest);
  }

  @Get('/get-sell-order-detail/:id')
  @Response(UserOrderInfoBaseResponse)
  public async showSellOrderInfo(
    @CurrentUser({ required: true }) currentUser: User,
    @Params() params: RefIDParamRequest
  ) {
    return await this.getSellOrderDetailUseCase.getOrderDetail(currentUser, params.id, TradeType.SELL);
  }

  @UseLimitMiddleware()
  @Put('/confirm-received')
  @Response(EmptyResponse)
  public async confirmReceived(@CurrentUser({ required: true }) currentUser: User, @Body() params: RefIDParamRequest) {
    return await this.confirmFiatReceivedUseCase.confirmReceived(currentUser, params.id);
  }

  @UseLimitMiddleware()
  @Put('/cancel-sell-order')
  @UseBefore(json(), verifyCaptchaByCloudFlare)
  @Response(EmptyResponse)
  public async cancelSelOrder(@CurrentUser({ required: true }) currentUser: User, @Body() params: RefIDParamRequest) {
    return await this.cancelSellOrderUseCase.cancelOrder(currentUser, params.id);
  }

  @UseLimitMiddleware()
  @Post('/submit-crypto-transaction')
  @Response(CryptoTransactionResponse)
  public async submitCryptoTransaction(
    @CurrentUser({ required: true }) currentUser: User,
    @Body() body: SubmitCryptoTransactionRequest
  ) {
    return await this.submitCryptoTransactionUseCase.submit(currentUser, body);
  }

  @UseLimitMiddleware()
  @Post('/contact-merchant-sell-order')
  @Response(UserCreateAppealResponse)
  public async appealSellOrder(@CurrentUser({ required: true }) currentUser: User, @Body() params: RefIDParamRequest) {
    return await this.contactMerchantOrderUseCase.contact(currentUser, params.id, TradeType.SELL);
  }

  @UseLimitMiddleware()
  @Post('/request-confirmation-transaction')
  @Response(UserRequestConfirmationResponse)
  public async requestTransactionConfirmation(@CurrentUser({ required: true }) currentUser: User, @Body() orderRequest: RefIDParamRequest) {
    return await this.requestTransactionConfirmationUseCase.requestConfirmation(currentUser, orderRequest.id);
  }
}
