import { BUY_ORDER_STEPS, Order, SELL_ORDER_STEP } from '@api/order/models/Order';
import { TradeType } from '@api/common/models';
import { BUY_APPEAL_RESULTS, SELL_APPEAL_RESULTS } from '@api/appeal/models/Appeal';
import { botSendMessage } from './chat.utils';

export async function sendSystemNotification(order: Order) {
  if (order?.roomId) {
    const msgs = order.type === TradeType.BUY ? buildBuyAppealNotification(order) : buildSellAppealNotification(order);
    if (msgs?.filter(msg => msg)?.length) {
      for (const msg of msgs) {
        await botSendMessage({
          roomId: order.roomId,
          msg,
        });
      }
    }
  }
}

function buildBuyAppealNotification(order: Order) {
  const messages: string[] = [];
  switch (order.step) {
    case BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER:
      messages.push('Bắt đầu cuộc trò chuyện');
      break;
    case BUY_ORDER_STEPS.BUY_ORDER_CREATED_BY_USER_DEAL_TIME:
    case BUY_ORDER_STEPS.BUY_NOTIFY_SENT_FIAT_BY_USER_DEAL_TIME:
      if (order.appeal) {
        messages.push('Người mua đã liên hệ với người bán vì có vấn đề về giao dịch');
      } else {
        messages.push('Bắt đầu cuộc trò chuyện');
      }
      break;
    case BUY_ORDER_STEPS.BUY_APPEAL_SENT_WHILE_CONFIRMING_FIAT_BY_MERCHANT:
      messages.push('Giao dịch có khiếu nại.');
      break;
    case BUY_ORDER_STEPS.BUY_APPEAL_SENT_SENDING_CRYPTO_FAILED:
      if (order.appeal?.decisionResult) {
        messages.push(buildDecisionResultBuyOrder(order.appeal?.decisionResult as BUY_APPEAL_RESULTS, order));
      } else {
        messages.push('Giao dịch có khiếu nại.');
      }
      break;
    case BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT:
      messages.push('Người bán đã nhận được thanh toán từ người mua. Vui lòng chờ người bán chuyển tiền mã hóa.');
      break;
    case BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME:
      messages.push(buildDecisionResultBuyOrder(order.appeal?.decisionResult as BUY_APPEAL_RESULTS, order));
      break;
    case BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_SUCCESS:
      messages.push('Tiền mã hóa đã được chuyển vào địa chỉ ví của người mua. Giao dịch hoàn thành.');
      break;
    case BUY_ORDER_STEPS.BUY_SENDING_CRYPTO_FAILED:
      if (order.appeal?.decisionResult) {
        messages.push(buildDecisionResultBuyOrder(order.appeal?.decisionResult as BUY_APPEAL_RESULTS, order));
      } else if (order.appeal) {
        messages.push('Người mua đã liên hệ với người bán vì có vấn đề về giao dịch');
      }
    break;
    case BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_USER:
      messages.push('Giao dịch đã bị hủy. Vui lòng liên hệ bộ phận CSKH nếu có thắc mắc.');
      break;
    case BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM:
      messages.push(buildDecisionResultBuyOrder(order.appeal?.decisionResult as BUY_APPEAL_RESULTS, order));
      break;
    default:
      messages.push('');
      break;
  }
  return messages;
}

function buildSellAppealNotification(order: Order) {
  const messages: string[] = [];
  switch (order.step) {
    case SELL_ORDER_STEP.SELL_SENDING_CRYPTO_BY_USER:
      messages.push('Người bán đã liên hệ bộ phận CSKH vì có vấn đề trong lúc chuyển tiền mã hóa');
      break;
    case SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS:
      messages.push(`Bắt đầu cuộc trò chuyện`);
      break;
    case SELL_ORDER_STEP.SELL_SENDING_CRYPTO_SUCCESS_DEAL_TIME:
      if (order.appeal) {
        messages.push(`Người bán đã liên hệ với người mua vì có vấn đề về giao dịch`);
      } else {
        messages.push(`Bắt đầu cuộc trò chuyện`);
      }
      break;
    case SELL_ORDER_STEP.SELL_NOTIFY_SENT_FIAT_BY_MERCHANT_DEAL_TIME:
      if (order.appeal) {
        messages.push(`Người bán đã liên hệ với người mua vì có vấn đề về giao dịch`);
      }
      break;
    case SELL_ORDER_STEP.SELL_APPEAL_SENT_FIAT_NOT_RECEIVED_BY_USER:
      messages.push(`Giao dịch có khiếu nại`);
      break;
    case SELL_ORDER_STEP.SELL_CONFIRMED_FIAT_BY_USER:
      if (order.appeal?.decisionResult === SELL_APPEAL_RESULTS.SELL_MCWIN_SUCCESS) {
        messages.push(`Giao dịch hoàn thành, người mua đã thắng kiện. Vui lòng liên hệ bộ phận CSKH nếu có thắc mắc`);
      } else {
        messages.push(`Người bán đã nhận được thanh toán từ người mua. Giao dịch hoàn thành.`);
      }
      break;
    case SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_USER:
      messages.push(`Giao dịch đã bị hủy. Vui lòng liên hệ hỗ trợ khách hàng nếu có thắc mắc.`);
      break;
    case SELL_ORDER_STEP.SELL_ORDER_CANCELLED_BY_SYSTEM:
      messages.push(buildDecisionResultSellOrder(order.appeal?.decisionResult as SELL_APPEAL_RESULTS));
      break;
    default:
      messages.push('');
      break;
  }
  return messages;
}

function buildDecisionResultBuyOrder (decisionResult: BUY_APPEAL_RESULTS, order?: Order) {
  switch (decisionResult) {
    case BUY_APPEAL_RESULTS.BUY_EUWIN_REOPEN:
      return order.amount === order.requestAmount
        ? 'Giao dịch được mở lại. Vui lòng liên hệ bộ phận CSKH nếu có thắc mắc.'
        : `Giao dịch được mở lại, số tiền đã được thay đổi từ ~ ${order.requestAmount} ${order.asset?.name} thành ~ ${order.amount} ${order.asset?.name}.`;
    case BUY_APPEAL_RESULTS.BUY_NOWIN_CANCEL_EVIDENT_NOT_APPROVED:
      return 'Giao dịch đã bị hủy vì các bên liên quan không cung cấp đủ bằng chứng để xử lý. Vui lòng liên hệ bộ phận CSKH nếu có thắc mắc.';
    case BUY_APPEAL_RESULTS.BUY_MCWIN_CANCEL:
      return 'Giao dịch đã bị hủy, người bán đã thắng kiện. Vui lòng liên hệ bộ phận CSKH nếu có thắc mắc.';
    case BUY_APPEAL_RESULTS.BUY_EUWIN_CANCEL_MC_VIOLATE:
      return 'Giao dịch đã bị hủy, người mua đã thắng kiện. Bộ phận CSKH sẽ hoàn tiền pháp định cho người mua và tiến hành xử phạt người bán.';
    case BUY_APPEAL_RESULTS.BUY_EUWIN_FORCE_CLOSE:
      return 'Giao dịch đã bị hủy vì người bán không chuyển tiền mã hóa cho người mua. Bộ phận CSKH sẽ hoàn tiền pháp định cho người mua và tiến hành xử phạt người bán.';
    case BUY_APPEAL_RESULTS.BUY_NOWIN_CANCEL_MC_HAS_RETURNED:
      return 'Giao dịch đã bị hủy, người bán đã hoàn tiền pháp định cho người mua. Vui lòng liên hệ bộ phận CSKH nếu có thắc mắc.';
    default:
      if (order?.step === BUY_ORDER_STEPS.BUY_CONFIRMED_FIAT_BY_MERCHANT_DEAL_TIME) {
        return 'Người mua đã liên hệ với người bán vì có vấn đề về giao dịch';
      } else if (order?.step === BUY_ORDER_STEPS.BUY_ORDER_CANCELLED_BY_SYSTEM) {
        return 'Giao dịch đã bị hủy bởi hệ thống';
      }
      return '';
  }
}

function buildDecisionResultSellOrder (decisionResult: SELL_APPEAL_RESULTS) {
  switch (decisionResult) {
    case SELL_APPEAL_RESULTS.SELL_NOWIN_CANCEL_MC_HAS_RETURNED:
      return 'Giao dịch đã bị hủy, người mua đã chuyển hoàn tiền mã hóa cho người bán. Vui lòng liên hệ hỗ trợ khách hàng nếu có thắc mắc.';
    case SELL_APPEAL_RESULTS.SELL_MCWIN_SUCCESS:
      return 'Giao dịch hoàn thành, người mua đã thắng kiện. Vui lòng liên hệ bộ phận CSKH nếu có thắc mắc';
    case SELL_APPEAL_RESULTS.SELL_EUWIN_CANCEL_MC_VIOLATE:
      return 'Giao dịch đã bị hủy, người bán đã thắng kiện. Bộ phận CSKH sẽ hoàn tiền pháp định cho người bán và tiến hành xử phạt người mua';
    default:
      return '';
  }
}
