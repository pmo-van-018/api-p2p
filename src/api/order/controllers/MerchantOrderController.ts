import {CryptoTransactionStatusResponse} from '@api/order/responses/Orders/User/CryptoTransactionStatusResponse';
import {P2PError} from '@api/common/errors/P2PError';
import {MERCHANT_ROLE_TYPE, TradeType} from '@api/common/models/P2PEnum';
import {RefIDParamRequest} from '@api/common/requests/BaseRequest';
import {ControllerBase} from '@api/infrastructure/abstracts/ControllerBase';
import {exactlyOnce, UseLimitMiddleware} from '@api/middlewares/local/LimitMiddleware';
import {
  OperationOrderInfoDetailResponse, OperationOrderSearchResponse,
} from '@api/order/responses/Orders/Operation';
import {Operation} from '@api/profile/models/Operation';
import {Response} from '@base/decorators/Response';
import {
  Body,
  CurrentUser,
  Get,
  JsonController,
  Params,
  Post,
  Put,
  QueryParams,
  Req
} from 'routing-controllers';
import {OrderLifeCycleError} from '../errors/OrderLifeCycleError';
import {GetOrderDetailUseCase} from '@api/order/usecase/merchant/GetOrderDetailUseCase';
import {ConfirmFiatSentUseCase} from '@api/order/usecase/merchant/ConfirmFiatSentUseCase';
import {EmptyResponse} from '@api/common/responses/EmptyResponse';
import {MerchantAuthorized} from '@api/auth/services/MerchantAuthorized';
import {ConfirmPaidUseCase} from '@api/order/usecase/merchant/ConfirmPaidUseCase';
import {SubmitCryptoTransactionUseCase} from '@api/order/usecase/merchant/SubmitCryptoTransactionUseCase';
import {SubmitCryptoTransactionRequest} from '@api/order/requests/SubmitCryptoTransactionRequest';
import {CheckTransactionCryptoStatusUseCase} from '@api/order/usecase/merchant/CheckTransactionCryptoStatusUseCase';
import {MerchantOrderListRequest} from '@api/order/requests/MerchantOrderListRequest';
import {GetListOrderUseCase} from '@api/order/usecase/merchant/GetListOrderUseCase';
import {CountPickedOrderResponse} from '@api/order/responses/Orders/Operation/CountPickedOrderResponse';
import {OrderPriceStatisticByPeriodResponse} from '@api/order/responses/Orders/OrderSearchResponse';
import {GetOrderPriceStatisticByPeriodRequest} from '@api/order/requests/GetOrderPriceStatisticByPeriodRequest';
import {ReceiveAppealOrderUseCase} from '@api/order/usecase/merchant/ReceiveAppealOrderUseCase';
import {ResolveAppealOrderUseCase} from '@api/order/usecase/merchant/ResolveAppealOrderUseCase';
import {CountPickedOrderUserCase} from '@api/order/usecase/merchant/CountPickedOrderUserCase';
import {GetOrderPriceStatisticByPeriodUseCase} from '@api/order/usecase/merchant/GetOrderPriceStatisticByPeriodUseCase';
import {CryptoTransactionResponse} from '@api/order/responses/Orders';
import { ConfirmSentFiatRequest } from '../requests/ConfirmSentFiatRequest';
import { RequestCancelPaymentTicketUseCase } from '../usecase/merchant/RequestCancelPaymentTicketUseCase';
import { ConfirmTemporaryPaymentUseCase } from '../usecase/merchant/ConfirmTemporaryPaymentUseCase';
import { OrderRefIdRequest } from '../requests/OrderRefIdRequest';

@JsonController('/order/merchant')
export class MerchantOrderController extends ControllerBase {
  constructor(
    private getOrderDetailUseCase: GetOrderDetailUseCase,
    private confirmFiatSentUseCase: ConfirmFiatSentUseCase,
    private confirmPaidUseCase: ConfirmPaidUseCase,
    private submitCryptoTransactionUseCase: SubmitCryptoTransactionUseCase,
    private checkTransactionCryptoStatusUseCase: CheckTransactionCryptoStatusUseCase,
    // management
    private getListOrderUseCase: GetListOrderUseCase,
    private receiveAppealOrderUseCase: ReceiveAppealOrderUseCase,
    private resolveAppealOrderUseCase: ResolveAppealOrderUseCase,
    private countPickedOrderUserCase: CountPickedOrderUserCase,
    private getOrderPriceStatisticByPeriodUseCase: GetOrderPriceStatisticByPeriodUseCase,
    private requestCancelPaymentTicketUseCase: RequestCancelPaymentTicketUseCase,
    private confirmTemporaryPaymentUseCase: ConfirmTemporaryPaymentUseCase
  ) {
    super();
  }

  @Get('/get-buy-order-detail/:id')
  @MerchantAuthorized()
  @Response(OperationOrderInfoDetailResponse)
  public async showBuyOrderInfo(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: RefIDParamRequest
  ) {
    return await this.getOrderDetailUseCase.getOrderDetail(currentUser, params.id, TradeType.BUY);
  }

  @UseLimitMiddleware()
  @Put('/confirm-paid')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER, MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Response(EmptyResponse)
  public async confirmPaid(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: RefIDParamRequest
  ) {
    return await this.confirmPaidUseCase.confirmPaid(currentUser, body.id);
  }

  @UseLimitMiddleware()
  @Post('/submit-crypto-transaction')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER, MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Response(CryptoTransactionResponse)
  public async submitCryptoTransaction(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: SubmitCryptoTransactionRequest
  ) {
    return await this.submitCryptoTransactionUseCase.submitCryptoTransaction(
      currentUser,
      body
    );
  }

  @UseLimitMiddleware()
  @Put('/cancel-payment-ticket')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER, MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Response(EmptyResponse)
  public async cancelPaymentPick(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: OrderRefIdRequest
  ) {
    return await this.requestCancelPaymentTicketUseCase.requestCancel(currentUser, body);
  }

  @Get('/get-sell-order-detail/:id')
  @MerchantAuthorized()
  @Response(OperationOrderInfoDetailResponse)
  public async showSellOrderInfo(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: RefIDParamRequest
  ) {
    return await this.getOrderDetailUseCase.getOrderDetail(currentUser, params.id, TradeType.SELL);
  }

  @UseLimitMiddleware()
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER, MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Put('/confirm-sent')
  @Response(EmptyResponse)
  public async confirmSent(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: ConfirmSentFiatRequest
  ) {
    return await this.confirmFiatSentUseCase.confirmSent(currentUser, body);
  }

  @UseLimitMiddleware()
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER, MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Put('/confirm-temporary-payment')
  @Response(EmptyResponse)
  public async confirmTermporaryPayment(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Body() body: ConfirmSentFiatRequest
  ) {
    return await this.confirmTemporaryPaymentUseCase.confirmTemporaryPayment(currentUser, body);
  }

  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_OPERATOR])
  @Get('/transaction-crypto-status/:id')
  @Response(CryptoTransactionStatusResponse)
  public async checkTransactionCryptoStatus(
    @Req() req: any,
    @Params() params: RefIDParamRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return exactlyOnce(req, async () => {
      return await this.checkTransactionCryptoStatusUseCase.checkTransactionStatus(currentUser.id, params.id);
    }, () => { throw new P2PError(OrderLifeCycleError.RPC_STATUS_IS_UPDATING); });
  }

  /**
   * Merchant order management
   */
  @MerchantAuthorized()
  @Get('/list-orders')
  @Response(OperationOrderSearchResponse)
  public async findOrders(
    @QueryParams() merchantOrderListRequest: MerchantOrderListRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getListOrderUseCase.getOrders(currentUser, merchantOrderListRequest);
  }

  @UseLimitMiddleware()
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_SUPPORTER])
  @Put('/receive-appeal-order/:id')
  @Response(EmptyResponse)
  public async receiveAppealOrder(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: RefIDParamRequest
  ) {
    return await this.receiveAppealOrderUseCase.receiveAppealOrder(currentUser, params.id);
  }

  @UseLimitMiddleware()
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_SUPPORTER])
  @Put('/resolve-appeal-order/:id')
  @Response(EmptyResponse)
  public async resolveAppealOrder(
    @CurrentUser({ required: true }) currentUser: Operation,
    @Params() params: RefIDParamRequest
  ) {
    return await this.resolveAppealOrderUseCase.resolveAppealOrder(currentUser, params.id);
  }

  @Get('/count-picked-order')
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_SUPPORTER])
  @Response(CountPickedOrderResponse)
  public async countPickedOrder(
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.countPickedOrderUserCase.countPicked(currentUser);
  }

  @Get('/compare-price-statistic')
  @Response(OrderPriceStatisticByPeriodResponse)
  @MerchantAuthorized([MERCHANT_ROLE_TYPE.MERCHANT_MANAGER])
  public async getOrderPriceStatisticByPeriod(
    @QueryParams() getOrderPriceStatisticByPeriodRequest: GetOrderPriceStatisticByPeriodRequest,
    @CurrentUser({ required: true }) currentUser: Operation
  ) {
    return await this.getOrderPriceStatisticByPeriodUseCase.getOrderPriceStatistic(currentUser, getOrderPriceStatisticByPeriodRequest);
  }
}
