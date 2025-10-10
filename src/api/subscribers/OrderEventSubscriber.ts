import { EventSubscriber, On } from 'event-dispatch';
import { Container } from 'typedi';

import { TradeType } from '@api/common/models';
import { CryptoTransaction } from '@api/order/models/CryptoTransaction';
import { Order } from '@api/order/models/Order';
import { Post } from '@api/post/models/Post';
import { events } from './events';

import { BuyOrderLifeCycleQueueService } from '@api/order/queues/BuyOrderQueueService';
import { CryptoTransactionQueueService } from '@api/order/queues/CryptoTransactionQueueService';
import { SellOrderLifeCycleQueueService } from '@api/order/queues/SellOrderQueueService';

@EventSubscriber()
export class OrderEventSubscriber {
  private buyOrderQueueService: BuyOrderLifeCycleQueueService;
  private sellOrderQueueService: SellOrderLifeCycleQueueService;
  private cryptoTransactionQueueService: CryptoTransactionQueueService;

  constructor() {
    this.buyOrderQueueService = Container.get<BuyOrderLifeCycleQueueService>(BuyOrderLifeCycleQueueService);
    this.sellOrderQueueService = Container.get<SellOrderLifeCycleQueueService>(SellOrderLifeCycleQueueService);
    this.cryptoTransactionQueueService = Container.get<CryptoTransactionQueueService>(CryptoTransactionQueueService);
  }

  @On(events.actions.order.buy.userCreateBuyOrder)
  public onUserCreateBuyOrder(order: Order): void {
    this.buyOrderQueueService.add(events.actions.order.buy.userCreateBuyOrder, { order });
  }

  @On(events.actions.order.buy.userConfirmPayment)
  public onUserConfirmPayment(order: Order) {
    this.buyOrderQueueService.add(events.actions.order.buy.userConfirmPayment, { order });
  }

  @On(events.actions.order.buy.merchantConfirmPayment)
  public onMerchantConfirmPayment(order: Order) {
    this.buyOrderQueueService.add(events.actions.order.buy.merchantConfirmPayment, { order });
  }

  @On(events.actions.order.buy.userCancelled)
  public onUserCancelled(order: Order) {
    this.buyOrderQueueService.add(events.actions.order.buy.userCancelled, { order });
  }

  @On(events.actions.order.buy.merchantSubmitTransaction)
  public async onMerchantSubmitTransaction(data: { order: Order; cryptoTransaction: CryptoTransaction }) {
    const { order, cryptoTransaction } = data;
    this.buyOrderQueueService.add(events.actions.order.buy.merchantSubmitTransaction, { order });
    this.cryptoTransactionQueueService.add(events.actions.order.buy.merchantSubmitTransaction, {
      cryptoTransaction: { ...cryptoTransaction, order },
    });
  }

  @On(events.actions.order.buy.operatorCreateChatRoom)
  public async onOperatorCreateChatRoomOrderBuy(order: Order) {
    this.buyOrderQueueService.add(events.actions.order.buy.operatorCreateChatRoom, { order });
  }

  @On(events.actions.order.sell.operatorCreateChatRoom)
  public async onOperatorCreateChatRoomOrderSell(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.operatorCreateChatRoom, { order });
  }

  @On(events.actions.order.sell.userRequestTransactionConfirmation)
  public async userRequestTransactionConfirmation(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.userRequestTransactionConfirmation, { order });
  }

  @On(events.actions.order.sell.cancelOrderByAdminSupporter)
  public async cancelOrderByAdminSupporter(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.cancelOrderByAdminSupporter, { order });
  }

  @On(events.actions.order.buy.systemUpdateTransactionStatus)
  public async onSystemUpdateTransactionStatus(data: { order: Order; cryptoTransaction: CryptoTransaction }) {
    if (data.order.type === TradeType.BUY) {
      this.buyOrderQueueService.add(events.actions.order.buy.systemUpdateTransactionStatus, data);
    }
  }

  @On(events.actions.order.sell.rpcUnknowError)
  public async onSystemUpdateTransactionUnknowError(data: { order: Order }) {
    this.sellOrderQueueService.add(events.actions.order.sell.rpcUnknowError, data);
  }

  @On(events.actions.order.buy.systemUpdateStep)
  public onSystemUpdateSendingFiatTimeout(order: Order) {
    this.buyOrderQueueService.add(events.actions.order.buy.systemUpdateStep, { order });
  }

  @On(events.actions.order.buy.systemUpdateAppealTimeout)
  public onSystemUpdateAppealTimeout(order: Order) {
    this.buyOrderQueueService.add(events.actions.order.buy.systemUpdateAppealTimeout, { order });
  }

  @On(events.actions.order.buy.systemCancelOrder)
  public async onSystemCancelOrder(data: { order: Order; post: Post }) {
    this.buyOrderQueueService.add(events.actions.order.buy.systemCancelOrder, data);
  }

  @On(events.actions.order.buy.systemFinishOrder)
  public onSystemFinishBuyOrder(order: Order) {
    if (order.type === TradeType.BUY) {
      this.buyOrderQueueService.add(events.actions.order.buy.systemFinishOrder, { order });
    }
  }

  @On(events.actions.order.buy.adminAddToBacklist)
  public onAdminAddToBacklistBuyOrder(orderId: string) {
    this.buyOrderQueueService.add(events.actions.order.buy.adminAddToBacklist, {orderId});
  }

  /*
  Sell Order Event
   */
  @On(events.actions.order.sell.merchantConfirmSentPayment)
  public onMerchantConfirmSellPayment(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.merchantConfirmSentPayment, { order });
  }

  @On(events.actions.order.sell.userCreateOrder)
  public onUserCreateSellOrder(order: Order): void {
    this.sellOrderQueueService.add(events.actions.order.sell.userCreateOrder, { order });
  }

  @On(events.actions.order.sell.userConfirmReceived)
  public async onUserConfirmReceived(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.userConfirmReceived, { order });
  }

  @On(events.actions.order.sell.userCancelOrder)
  public onUserCancelledSellOrder(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.userCancelOrder, { order });
  }

  @On(events.actions.order.sell.userSubmitTransaction)
  public onUserSubmitTransaction(data: { order: Order; cryptoTransaction: CryptoTransaction }) {
    const { order, cryptoTransaction } = data;
    this.cryptoTransactionQueueService.add(events.actions.order.sell.userSubmitTransaction, {
      cryptoTransaction: { ...cryptoTransaction, order },
    });
    this.sellOrderQueueService.add(events.actions.order.sell.userSubmitTransaction, { order });
  }

  @On(events.actions.order.sell.systemUpdateStepOrder)
  public onSystemUpdateStepSellOrder(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.systemUpdateStepOrder, { order });
  }

  @On(events.actions.order.sell.systemCancelOrder)
  public async onSystemCancelSellOrder(data: { order: Order; post: Post }) {
    this.sellOrderQueueService.add(events.actions.order.sell.systemCancelOrder, data);
  }

  @On(events.actions.order.sell.systemFinishOrder)
  public onSystemFinishSellOrder(order: Order) {
    if (order.type === TradeType.SELL) {
      this.sellOrderQueueService.add(events.actions.order.sell.systemFinishOrder, { order });
    }
  }

  @On(events.actions.order.sell.systemUpdateTransactionStatus)
  public async onSystemUpdateTransactionStatusOrderSell(data: { order: Order; cryptoTransaction: CryptoTransaction }) {
    if (data.order.type === TradeType.SELL) {
      this.sellOrderQueueService.add(events.actions.order.sell.systemUpdateTransactionStatus, data);
    }
  }

  @On(events.actions.order.sell.adminAddToBacklist)
  public onAdminAddToBacklistSellOrder(orderId: string) {
    this.sellOrderQueueService.add(events.actions.order.sell.adminAddToBacklist, {orderId});
  }

  @On(events.actions.cryptoTransaction.missingTransaction)
  public onMissingTransactionChecker(transactionIds: string[]) {
    this.cryptoTransactionQueueService.add(events.actions.cryptoTransaction.missingTransaction, {
      transactionIds,
    });
  }
  
  // Payment Ticket
  @On(events.actions.order.sell.merchantCreatePaymentTicket)
  public onMerchantCreatePaymentTicket(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.merchantCreatePaymentTicket, { order });
  }

  @On(events.actions.order.sell.merchantPickPaymentTicket)
  public onMerchantPickPaymentTicket(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.merchantPickPaymentTicket, { order });
  }

  @On(events.actions.order.sell.merchantCancelPaymentTicket)
  public onMerchantCancelPaymentTicket(order: Order) {
    this.sellOrderQueueService.add(events.actions.order.sell.merchantCancelPaymentTicket, { order });
  }
}
