import { NOTIFICATION_TYPE, OperationType, UserType } from '@api/common/models/P2PEnum';
import { NotificationMessage } from '@api/notification/types/Notification';
import { convertOrderIdsToString } from '@base/utils/string.utils';
import { SUB_DOMAIN_OPERATIONS_LINK } from '@api/common/models/P2PConstant';
import { Service } from 'typedi';

@Service()
export class BuildNotificationContentService {
  public getNotificationMessage(data: NotificationMessage) {
    const {
      notificationCase,
      transactionId,
      transactionType,
      username,
      amount,
      currency,
      link,
      datetime,
      bankName,
      walletAddress,
      endUserId,
      orderIds,
      merchantWalletAddress,
      merchantManagerWalletAddress,
      transactionIds,
      transactionRefId,
      assetNetworks,
      operatorName,
      oldWalletAddress,
      newWalletAddress,
      managerProfileId,
      oldValue,
      newValue,
      assetBalances,
    } = data;
    let result = {
      title: '',
      description: '',
      link: '',
      roles: [],
    };
    const subOperationsLink = SUB_DOMAIN_OPERATIONS_LINK;
    const typeOrder = transactionType?.toLowerCase();
    const linkUserOrderDetail = `/${typeOrder}/order-detail/${transactionRefId}`;
    switch (notificationCase) {
      // buy
      case NOTIFICATION_TYPE.BUY_ORDER_CREATED_BY_USER:
        result = {
          title: `Giao dịch bán ${currency} mới`,
          description: `Bạn có giao dịch #${transactionRefId} bán ${amount} ${currency} đang chờ từ người mua ${username}, vui lòng kiểm tra và thực hiện giao dịch trên.`,
          link: `${subOperationsLink}/merchant/orders?status=pending-user-confirm`,
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_USER_APPEAL_TO_MERCHANT:
        result = {
          title: 'Khiếu nại từ người mua',
          description: `Bạn có khiếu nại từ người mua ${username} trong giao dịch #${transactionRefId} bán ${amount} ${currency} đang được CSKH xem xét, vui lòng kiểm tra và phản hồi khiếu nại trên.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_USER_APPEAL_TO_ADMIN:
        result = {
          title: 'Khiếu nại từ người mua',
          description: `Người mua ${username} trong giao dịch #${transactionRefId} mua ${amount} ${currency} đã gửi yêu cầu khiếu nại đến bạn, vui lòng kiểm tra và xử lý khiếu nại trên.`,
          link,
          roles: [OperationType.ADMIN_SUPPORTER, OperationType.SUPER_ADMIN],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_DEAL_TIME:
        result = {
          title: 'Gia hạn thời gian xử lý khiếu nại',
          description: `Thời gian xử lý khiếu nại cho giao dịch #${transactionRefId} mua ${amount} ${currency} đã được gia hạn đến ${datetime} UTC+00:00, vui lòng kiểm tra giao dịch và phản hồi khiếu nại.`,
          link: `${endUserId ? linkUserOrderDetail : link}`,
          roles: [UserType.USER, OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;

      case NOTIFICATION_TYPE.BUY_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_USER:
        result = {
          title: 'Đóng khiếu nại',
          description: `Khiếu nại của bạn trong giao dịch #${transactionRefId} mua ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Người bán ${username} đã chuyển hoàn tiền pháp định đến tài khoản ngân hàng của bạn.`,
          link: linkUserOrderDetail,
          roles: [UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_MERCHANT:
        result = {
          title: 'Đóng khiếu nại',
          description: `Khiếu nại của người mua ${username} trong giao dịch #${transactionRefId} bán ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Bạn đã chuyển hoàn tiền pháp định đến tài khoản ngân hàng của người mua.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_CLOSE_APPEAL_NOT_COMPLETE_TO_USER:
        result = {
          title: 'Đóng khiếu nại',
          description: `Khiếu nại của bạn trong giao dịch #${transactionRefId} mua ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Bạn và người bán ${username} không cung cấp đủ bằng chứng để làm căn cứ xử lý.`,
          link: `${linkUserOrderDetail}`,
          roles: [UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_CLOSE_APPEAL_NOT_COMPLETE_TO_MERCHANT:
        result = {
          title: 'Đóng khiếu nại',
          description: `Khiếu nại của người mua ${username} trong giao dịch #${transactionRefId} bán ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Người mua ${username} và bạn không cung cấp đủ bằng chứng để làm căn cứ xử lý.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_USER:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Khiếu nại của bạn trong giao dịch #${transactionRefId} mua ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Người bán ${username} đã được CSKH phân xử thắng kiện trong giao dịch trên.`,
          link: `${linkUserOrderDetail}`,
          roles: [UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_MERCHANT:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Khiếu nại của người mua ${username} trong giao dịch #${transactionRefId} bán ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Bạn đã được CSKH phân xử thắng kiện trong giao dịch trên.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_USER_WIN_CANCEL_BUY_ORDER_TO_USER:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Bạn đã thắng kiện trong giao dịch #${transactionRefId} mua ${amount} ${currency}. Bộ phận CSKH đã chuyển hoàn tiền pháp định đến tài khoản ngân hàng của bạn.`,
          link: `${linkUserOrderDetail}`,
          roles: [UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_USER_WIN_CANCEL_BUY_ORDER_TO_MERCHANT:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Người mua ${username} đã thắng kiện trong giao dịch #${transactionRefId} bán ${amount} ${currency}. Bộ phận CSKH đã chuyển hoàn tiền pháp định đến tài khoản ngân hàng của người mua.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_USER_WIN_REOPEN_BUY_ORDER_TO_USER:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Bạn đã thắng kiện trong giao dịch #${transactionRefId} mua ${amount} ${currency}. Bộ phận CSKH đã mở lại giao dịch để người bán ${username} hoàn thành việc chuyển tiền mã hóa.`,
          link: `${linkUserOrderDetail}`,
          roles: [UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_RESULT_APPEAL_USER_WIN_REOPEN_BUY_ORDER_TO_MERCHANT:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Người mua ${username} đã thắng kiện trong giao dịch #${transactionRefId} bán ${amount} ${currency}. Bộ phận CSKH đã mở lại giao dịch để bạn hoàn thành việc chuyển tiền mã hóa. Phí phạt sẽ áp dụng lên giao dịch này.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;

      // sell
      case NOTIFICATION_TYPE.SELL_ORDER_CREATED_BY_USER:
        result = {
          title: `Giao dịch mua ${currency} mới`,
          description: `Bạn có giao dịch #${transactionRefId} mua ${amount} ${currency} đang chờ từ người bán ${username}, vui lòng kiểm tra và thực hiện giao dịch trên.`,
          link: `${subOperationsLink}/merchant/orders?status=pending-user-confirm`,
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_USER_APPEAL_TO_MERCHANT:
        result = {
          title: 'Khiếu nại từ người bán',
          description: `Bạn có khiếu nại từ người bán ${username} trong giao dịch #${transactionRefId} mua ${amount} ${currency} đang được CSKH xem xét, vui lòng kiểm tra và phản hồi khiếu nại trên.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_USER_APPEAL_TO_ADMIN:
        result = {
          title: 'Khiếu nại từ người bán',
          description: `Người bán ${username} trong giao dịch #${transactionRefId} bán ${amount} ${currency} đã gửi yêu cầu khiếu nại đến bạn, vui lòng kiểm tra và xử lý khiếu nại trên.`,
          link,
          roles: [OperationType.ADMIN_SUPPORTER, OperationType.SUPER_ADMIN],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_DEAL_TIME:
        result = {
          title: 'Gia hạn thời gian xử lý khiếu nại',
          description: `Thời gian xử lý khiếu nại cho giao dịch #${transactionRefId} bán ${amount} ${currency} đã được gia hạn đến ${datetime} UTC+00:00, vui lòng kiểm tra giao dịch và phản hồi khiếu nại.`,
          link: `${endUserId ? `${linkUserOrderDetail}` : link}`,
          roles: [UserType.USER, OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;

      case NOTIFICATION_TYPE.SELL_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_USER:
        result = {
          title: 'Đóng khiếu nại',
          description: `Khiếu nại của bạn trong giao dịch #${transactionRefId} bán ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Người mua ${username} đã chuyển hoàn tiền mã hóa đến địa chỉ ví của bạn.`,
          link: `${linkUserOrderDetail}`,
          roles: [UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_CLOSE_APPEAL_MERCHANT_REFUNDED_TO_MERCHANT:
        result = {
          title: 'Đóng khiếu nại',
          description: `Khiếu nại của người bán ${username} trong giao dịch #${transactionRefId} mua ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Bạn đã chuyển hoàn tiền mã hóa đến địa chỉ ví của người bán.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;

      case NOTIFICATION_TYPE.SELL_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_USER:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Khiếu nại của bạn trong giao dịch #${transactionRefId} bán ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Người bán ${username} đã được CSKH phân xử thắng kiện trong giao dịch trên.`,
          link: `${linkUserOrderDetail}`,
          roles: [UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_RESULT_APPEAL_MERCHANT_WIN_TO_MERCHANT:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Khiếu nại của người bán ${username} trong giao dịch #${transactionRefId} mua ${amount} ${currency} đã được đóng bởi bộ phận CSKH. Bạn đã được CSKH phân xử thắng kiện trong giao dịch trên.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_RESULT_APPEAL_USER_WIN_REFUND_TO_USER:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Bạn đã thắng kiện trong giao dịch #${transactionRefId} bán ${amount} ${currency}. Bộ phận CSKH đã chuyển hoàn tiền mã hóa đến địa chỉ ví của bạn.`,
          link: `${linkUserOrderDetail}`,
          roles: [UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_RESULT_APPEAL_USER_WIN_REFUND_TO_MERCHANT:
        result = {
          title: 'Kết quả khiếu nại',
          description: `Người bán ${username} đã thắng kiện trong giao dịch #${transactionRefId} mua ${amount} ${currency}. Bộ phận CSKH đã chuyển hoàn tiền mã hóa đến ví của người bán.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;

      // system
      case NOTIFICATION_TYPE.SYSTEM_CHANGE_ADS_TO_OFFLINE_AMOUNT_LOWER_FIAT:
        result = {
          title: `Quảng cáo ${transactionType} ${currency} đã chuyển sang ngoại tuyến`,
          description: `Hệ thống đã chuyển quảng cáo #${transactionRefId} sang trạng thái ngoại tuyến vì số lượng muốn ${transactionType} nhỏ hơn giới hạn lệnh tối thiểu. Vui lòng kiểm tra tin quảng cáo của bạn.`,
          link: `${subOperationsLink}/merchant/postings`,
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.SYSTEM_CHANGE_ADS_TO_CLOSE_AMOUNT_0:
        result = {
          title: `Quảng cáo ${transactionType} ${currency} đã hoàn tất`,
          description: `Hệ thống đã đóng quảng cáo #${transactionRefId} vì đã hoàn tất số lượng muốn ${transactionType}. Vui lòng kiểm tra chi tiết lịch sử quảng cáo của bạn.`,
          link: `${subOperationsLink}/merchant/postings-history/${transactionRefId}`,
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;

      case NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_TO_USER:
        result = {
          title: `Ngừng hỗ trợ giao dịch với ngân hàng ${bankName}`,
          description: `Ngân hàng ${bankName} không còn được hỗ trợ  trên hệ thống. Vui lòng kiểm tra và cập nhật phương thức thanh toán của bạn.`,
          link: `/user/payments`,
          roles: [UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_TO_MERCHANT:
        result = {
          title: `Ngừng hỗ trợ giao dịch với ngân hàng ${bankName}`,
          description: `Ngân hàng ${bankName} không còn được hỗ trợ  trên hệ thống. Vui lòng kiểm tra lại thông tin tài khoản thanh toán.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_ADS_TO_OFFLINE:
        result = {
          title: `Quảng cáo đã chuyển sang ngoại tuyến`,
          description: `Hệ thống đã chuyển quảng cáo ${transactionIds} sang trạng thái ngoại tuyến vì ngân hàng ${bankName} không còn được hỗ trợ giao dịch. Vui lòng kiểm tra tin quảng cáo của bạn.`,
          link: '',
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.ASSET_DISABLED_BY_ADMIN:
        result = {
          title: `Quảng cáo đã chuyển sang ngoại tuyến`,
          description: `Hệ thống đã chuyển quảng cáo ${transactionIds} sang trạng thái ngoại tuyến vì mạng ${assetNetworks} không còn được hỗ trợ giao dịch. Vui lòng kiểm tra tin quảng cáo của bạn.`,
          link: '',
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.BANK_DELETE_PAYMENT_METHOD_ADS_BY_MANAGER:
        result = {
          title: `Quảng cáo đã chuyển sang ngoại tuyến`,
          description: `Hệ thống đã chuyển quảng cáo ${transactionIds} sang trạng thái ngoại tuyến vì phương thức thanh toán không còn được hỗ trợ giao dịch. Vui lòng kiểm tra tin quảng cáo của bạn.`,
          link: `${subOperationsLink}/merchant/postings`,
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.BANK_UPDATE_PAYMENT_METHOD_ADS_BY_MANAGER:
        result = {
          title: `Quảng cáo đã chuyển sang ngoại tuyến`,
          description: `Hệ thống đã chuyển quảng cáo: ${transactionIds} sang trạng thái ngoại tuyến vì phương thức thanh toán đã được cập nhật dữ liệu. Vui lòng kiểm tra tin quảng cáo của bạn.`,
          link: `${subOperationsLink}/merchant/postings`,
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_DISABLE_MERCHANT_OPERATOR:
        result = {
          title: 'Vô hiệu hóa giao dịch viên',
          description: `Quản trị viên đã vô hiệu hóa giao dịch viên ${username} có địa chỉ ví ${walletAddress}. Vui lòng liên hệ quản trị viên nếu có bất kì thắc mắc nào. Xin cảm ơn!`,
          link: `${subOperationsLink}/merchant-manager/staffs`,
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_DISABLE_MERCHANT_OPERATOR_HAS_PENDING_ORDER:
        result = {
          title: 'Vô hiệu hóa giao dịch viên',
          description: `Quản trị viên đã vô hiệu hóa giao dịch viên ${username} có địa chỉ ví ${walletAddress}. Hệ thống đã chuyển các giao dịch đang chờ qua cho bạn xử lí, bao gồm: ${convertOrderIdsToString(
            orderIds
          )}. Vui lòng liên hệ quản trị viên nếu có bất kì thắc mắc nào. Xin cảm ơn!`,
          link: `${subOperationsLink}/merchant-manager/staffs`,
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_DISABLE_MERCHANT_SUPPORTER:
        result = {
          title: 'Vô hiệu hóa hỗ trợ viên',
          description: `Quản trị viên đã vô hiệu hóa hỗ trợ viên ${username} có địa chỉ ví ${walletAddress}. Vui lòng liên hệ quản trị viên nếu có bất kì thắc mắc nào. Xin cảm ơn!`,
          link: '',
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_NOTIFY_ENABLE_MERCHANT_OPERATOR_TO_MANAGER:
        result = {
          title: 'Bạn đã được kích hoạt',
          description: `Quản trị viên đã kích hoạt giao dịch viên ${username} có địa chỉ ví ${merchantWalletAddress}. Vui lòng liên hệ quản trị viên nếu có bất kì thắc mắc nào. Xin cảm ơn!`,
          link: `${subOperationsLink}/merchant-manager/staffs`,
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_NOTIFY_ENABLE_MERCHANT_SUPPORTER_TO_MANAGER:
        result = {
          title: 'Hỗ trợ viên đã được kích hoạt',
          description: `Quản trị viên đã kích hoạt hỗ trợ viên ${username} có địa chỉ ví ${merchantWalletAddress}. Vui lòng liên hệ quản trị viên nếu có bất kì thắc mắc nào. Xin cảm ơn!`,
          link: '',
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_NOTIFY_ENABLE_MERCHANT_OPERATOR_TO_OPERATOR:
        result = {
          title: 'Bạn đã được kích hoạt',
          description: `Quản trị viên đã kích hoạt lại tài khoản ${username} của bạn có địa chỉ ví ${walletAddress}. Hãy sẵn sàng trải nghiệm dịch vụ của ANOTRADE! Xin cảm ơn!`,
          link: '',
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_NOTIFY_ENABLE_MERCHANT_SUPPORTER_TO_SUPPORTER:
        result = {
          title: 'Bạn đã được kích hoạt',
          description: `Quản trị viên đã kích hoạt lại tài khoản ${username} của bạn có địa chỉ ví ${walletAddress}. Hãy sẵn sàng trải nghiệm dịch vụ của ANOTRADE! Xin cảm ơn!`,
          link: '',
          roles: [OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_ENABLE_MERCHANT_MANAGER_TO_MANAGER:
        result = {
          title: 'Bạn đã được kích hoạt',
          description: `Quản trị viên đã kích hoạt thương gia ${username} của bạn có địa chỉ ví ${walletAddress}. Hãy sẵn sàng trải nghiệm dịch vụ của ANOTRADE! Xin cảm ơn!`,
          link: '',
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_ENABLE_MERCHANT_MANAGER_TO_MERCHANT:
        result = {
          title: 'Bạn đã được kích hoạt',
          description: `Quản trị viên đã kích hoạt tài khoản ${username} của bạn có địa chỉ ví ${merchantManagerWalletAddress}. Hãy sẵn sàng trải nghiệm dịch vụ của ANOTRADE! Xin cảm ơn!`,
          link: '',
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_COMPLETED:
        result = {
          title: 'Giao dịch kết thúc',
          description: `Giao dịch ${convertOrderIdsToString(
            orderIds
          )} bạn tiếp nhận xử lí đã hoàn thành. Bạn có thể tiếp tục nhận xử lí các giao dịch khác!`,
          link: '',
          roles: [OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_NOTIFY_MERCHANT_SUPPORTER_ORDER_IS_CANCELED:
        result = {
          title: 'Giao dịch kết thúc',
          description: `Giao dịch ${convertOrderIdsToString(
            orderIds
          )} bạn tiếp nhận xử lí đã huỷ. Bạn có thể tiếp tục nhận xử lí các giao dịch khác!`,
          link: '',
          roles: [OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.MANAGER_NOTIFY_ENABLE_MERCHANT_OPERATOR_TO_OPERATOR:
        result = {
          title: 'Bạn đã được kích hoạt',
          description: `Thương gia đã kích hoạt lại tài khoản ${username} của bạn có địa chỉ ví ${walletAddress}. Hãy sẵn sàng trải nghiệm dịch vụ của ANOTRADE! Xin cảm ơn!
        `,
          link: '',
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.MANAGER_NOTIFY_ENABLE_MERCHANT_SUPPORTER_TO_SUPPORTER:
        result = {
          title: 'Bạn đã được kích hoạt',
          description: `Thương gia đã kích hoạt lại tài khoản ${username} của bạn có địa chỉ ví ${walletAddress}. Hãy sẵn sàng trải nghiệm dịch vụ của ANOTRADE! Xin cảm ơn!
        `,
          link: '',
          roles: [OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.SUPPORTER_RECEIVE_APPEAL_ORDER:
        result = {
          title: 'Tiếp nhận giao dịch',
          description: `Hỗ trợ viên ${username} đã tiếp nhận xử lí giao dịch ${convertOrderIdsToString(
            orderIds
          )}. Vui lòng theo dõi giao dịch để tiếp tục xử lí khi cần thiết`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ORDER_CANCELLED_BY_SYSTEM:
        result = {
          title: 'Giao dịch bị hủy',
          description: `Giao dịch #${transactionRefId} đã bị hủy bởi hệ thống!`,
          link,
          roles: [UserType.USER, OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ORDER_CANCELLED_BY_USER:
        result = {
          title: 'Giao dịch bị hủy',
          description: `Giao dịch #${transactionRefId} đã bị hủy bởi người dùng!`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_ACTIVE_ADMIN_SUPPORTER:
        result = {
          title: 'Bạn đã được kích hoạt',
          description: `Quản trị viên đã kích hoạt lại tài khoản ${username} của bạn có địa chỉ ví ${walletAddress}.`,
          link,
          roles: [OperationType.ADMIN_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_SUPPORTER_PICK_APPEAL:
        result = {
          title: 'Tiếp nhận khiếu nại',
          description: `Nhân viên CSKH ${username} đã tiếp nhận xử lí khiếu nại cho giao dịch #${transactionRefId}.`,
          link,
          roles: [OperationType.SUPER_ADMIN],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_CANCEL_SESSION_APPEAL:
        result = {
          title: 'Hủy phiên hỗ trợ',
          description: `Quản trị viên đã hủy bỏ phiên hỗ trợ của bạn tại khiếu nại cho giao dịch #${transactionRefId}. Vui lòng liên hệ quản trị viên nếu có bất kì thắc mắc nào. Xin cảm ơn!`,
          roles: [OperationType.ADMIN_SUPPORTER],
          link,
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_OPERATOR:
        result = {
          title: 'Liên hệ từ người mua',
          description: `Người mua ${username} đã liên hệ bạn trong giao dịch #${transactionRefId} - mua ${amount} ${currency}. Vui lòng kiểm tra và phản hồi.`,
          link: `${subOperationsLink}/merchant/orders?status=pending-progress`,
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.BUY_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_SUPPORTER:
        result = {
          title: 'Liên hệ từ người mua',
          description: `Người mua ${username} đã liên hệ giao dịch viên ${operatorName} trong giao dịch #${transactionRefId} - mua ${amount} ${currency}. Vui lòng kiểm tra và nhận xử lý.`,
          link: `${subOperationsLink}/supporter/orders`,
          roles: [OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_OPERATOR:
        result = {
          title: 'Liên hệ từ người bán',
          description: `Người bán ${username} đã liên hệ bạn trong giao dịch #${transactionRefId} - mua ${amount} ${currency}. Vui lòng kiểm tra và phản hồi.`,
          link: `${subOperationsLink}/merchant/orders?status=pending-progress`,
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_USER_AGREE_TO_MERCHANT_SEND_TO_SUPPORTER:
        result = {
          title: 'Liên hệ từ người bán',
          description: `Người bán ${username} đã liên hệ giao dịch viên ${operatorName} trong giao dịch #${transactionRefId} - mua ${amount} ${currency}. Vui lòng kiểm tra và nhận xử lý.`,
          link: `${subOperationsLink}/supporter/orders`,
          roles: [OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.USER_REQUEST_SUPPORT_TO_ADMIN_SUPPORT:
        result = {
          title: 'Yêu cầu hỗ trợ từ người dùng',
          description: `Có yêu cầu hỗ trợ từ phía người dùng ${username}. Vui lòng kiểm tra và xử lý.`,
          link: `/admin-supporter/support-requests`,
          roles: [OperationType.ADMIN_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.USER_REQUEST_SUPPORT_TO_SUPPER_ADMIN:
        result = {
          title: 'Yêu cầu hỗ trợ từ người dùng',
          description: `Có yêu cầu hỗ trợ từ phía người dùng ${username}.`,
          link: `/support-requests`,
          roles: [OperationType.SUPER_ADMIN],
        };
        break;
      case NOTIFICATION_TYPE.MANAGER_ACTIVE_WALLET_ADDRESS_TO_ADMIN:
        result = {
          title: 'Thay đổi địa chỉ ví',
          description: `Thương gia ${operatorName} đã thay đổi địa chỉ ví cũ ${oldWalletAddress} sang địa chỉ ví mới ${newWalletAddress}. Vui lòng kiểm tra và xác nhận với thương gia.`,
          link: `/merchant-managers/profile/${managerProfileId}`,
          roles: [OperationType.SUPER_ADMIN],
        };
        break;
      case NOTIFICATION_TYPE.MANAGER_ACTIVE_WALLET_ADDRESS_TO_STAFF:
        result = {
          title: 'Thay đổi địa chỉ ví',
          description: `Thương gia của bạn đã thay đổi địa chỉ ví cũ ${oldWalletAddress} sang địa chỉ ví mới ${newWalletAddress}. Vui lòng kiểm tra và xác nhận với thương gia của bạn.`,
          link: '',
          roles: [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_ACTIVE_WALLET_ADDRESS_TO_MERCHANT:
        result = {
          title: 'Thay đổi địa chỉ ví',
          description: `Quản trị viên đã thay đổi địa chỉ ví cũ của bạn từ ${oldWalletAddress} sang địa chỉ ví mới ${newWalletAddress}. Vui lòng kiểm tra và xác nhận với quản trị viên.`,
          link: '/merchant-manager/profile',
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.MANAGER_UPDATE_POSTING_TO_OPERATOR:
        result = {
          title: 'Quảng cáo được cập nhật',
          description: `Thương gia cập nhật quảng cáo ${transactionId} của bạn. Vui lòng kiểm tra.`,
          link: `${subOperationsLink}/merchant/postings`,
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.MANAGER_CHANGED_POST_STATUS_TO_ONLINE:
        result = {
          title: 'Quảng cáo đã chuyển sang trực tuyến',
          description: `Thương gia đã chuyển quảng cáo ${transactionId} của bạn sang trạng thái trực tuyến. Vui lòng kiểm tra.`,
          link: '/merchant/postings',
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.MANAGER_CHANGED_POST_STATUS_TO_OFFLINE:
        result = {
          title: 'Quảng cáo đã chuyển sang ngoại tuyến',
          description: `Thương gia đã chuyển quảng cáo ${transactionId} của bạn sang trạng thái ngoại tuyến. Vui lòng kiểm tra.`,
          link: '/merchant/postings',
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_UPDATE_PAYMENT_METHOD_LIMIT_MANAGER:
        result = {
          title: 'Điều chỉnh giới hạn thêm phương thức thanh toán',
          description: `Quản trị viên đã điều chỉnh giới hạn cho phép thêm phương thức thanh toán từ ${oldValue} -> ${newValue}. Nếu cần hỗ trợ hoặc có bất kỳ câu hỏi nào, xin vui lòng liên hệ với quản trị viên để được hỗ trợ.`,
          link: '/merchant-manager/payments',
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_UPDATE_APPEAL_LIMIT_MERCHANT_SUPPORTER:
        result = {
          title: 'Điều chỉnh giới hạn tiếp nhận giao dịch',
          description: `Quản trị viên đã điều chỉnh giới hạn tiếp nhận giao dịch của hỗ trợ viên từ ${oldValue} -> ${newValue}. Nếu cần hỗ trợ hoặc có bất kỳ câu hỏi nào, xin vui lòng liên hệ với quản trị viên để được hỗ trợ.`,
          link,
          roles: [OperationType.MERCHANT_MANAGER, OperationType.MERCHANT_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_UPDATE_APPEAL_LIMIT_ADMIN_SUPPORTER:
        result = {
          title: 'Điều chỉnh giới hạn tiếp nhận khiếu nại',
          description: `Quản trị viên đã điều chỉnh giới hạn tiếp nhận khiếu nại từ ${oldValue} -> ${newValue}. Nếu cần hỗ trợ hoặc có bất kỳ câu hỏi nào, xin vui lòng liên hệ với quản trị viên để được hỗ trợ.`,
          link: '/admin-supporter/list-appeals?status=pending',
          roles: [OperationType.ADMIN_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_UPDATE_CUSTOMER_REQUEST_LIMIT_ADMIN_SUPPORTER:
        result = {
          title: 'Điều chỉnh giới hạn tiếp nhận yêu cầu hỗ trợ',
          description: `Quản trị viên đã điều chỉnh giới hạn tiếp nhận yêu cầu hỗ trợ từ ${oldValue} -> ${newValue}. Nếu cần hỗ trợ hoặc có bất kỳ câu hỏi nào, xin vui lòng liên hệ với quản trị viên để được hỗ trợ.`,
          link: '/admin-supporter/support-requests?status=pending',
          roles: [OperationType.ADMIN_SUPPORTER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_UPDATE_EVIDENCE_TIME_LIMIT:
        result = {
          title: 'Điều chỉnh thời gian cung cấp bằng chứng của khiếu nại',
          description: `Quản trị viên đã điều chỉnh thời gian cung cấp bằng chứng của khiếu nại từ ${oldValue} phút -> ${newValue} phút. Nếu cần hỗ trợ hoặc có bất kỳ câu hỏi nào, xin vui lòng liên hệ với quản trị viên để được hỗ trợ.`,
          link,
          roles: [
            UserType.USER,
            OperationType.MERCHANT_OPERATOR,
            OperationType.MERCHANT_SUPPORTER,
            OperationType.MERCHANT_MANAGER,
            OperationType.ADMIN_SUPPORTER,
          ],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_UPDATE_CRYPTO_TRANSFER_TIME_LIMIT:
        result = {
          title: 'Điều chỉnh thời gian chờ xử lý tiền mã hóa',
          description: `Quản trị viên đã điều chỉnh thời gian chờ xử lý chuyển tiền mã hóa từ ${oldValue} phút -> ${newValue} phút. Nếu cần hỗ trợ hoặc có bất kỳ câu hỏi nào, xin vui lòng liên hệ với quản trị viên để được hỗ trợ.`,
          link,
          roles: [OperationType.MERCHANT_OPERATOR, UserType.USER],
        };
        break;
      case NOTIFICATION_TYPE.MANAGER_UPDATE_BALANCE_CONFIGURATION:
        result = {
          title: 'Cập nhật giới hạn số dư ví',
          description: `Thương gia đã cập nhật giới hạn số dư cho tài sản: ${assetBalances} .Vui lòng thực hiện chuyển tiền mã hóa về địa chỉ ví của thương gia khi đạt giới hạn.`,
          link: '/notification?tab=all',
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.OPERATOR_REACHED_THRESHOLD_OF_BALANCE:
        result = {
          title: 'Yêu cầu chuyển tiền mã hóa từ thương gia',
          description: `Tài sản ${assetNetworks} của bạn có số dư ${amount} đã đạt giới hạn cho phép. Vui lòng thực hiện chuyển tiền mã hóa về địa chỉ ví của thương gia.`,
          link: '/notification?tab=all',
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_ENABLE_GASLESS_TO_MANAGER:
        result = {
          title: 'Cho phép áp dụng gasless đối với giao dịch',
          description: `Quản trị viên đã cấp quyền cho các giao dịch của bạn được áp dụng gasless (Giao dịch không mất phí). Giới hạn giao dịch yêu cầu lớn hơn hoặc bằng ${amount}. Vui lòng liên hệ với quản trị viên nếu có bất kỳ thắc mắc nào`,
          link: '/notification?tab=all',
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.ADMIN_DISABLE_GASLESS_TO_MANAGER:
        result = {
          title: 'Bỏ áp dụng gasless đối với giao dịch',
          description: `Quản trị viên đã hủy quyền sử dụng gasless (Giao dịch không mất phí) cho các giao dịch của bạn. Vui lòng liên hệ với quản trị viên nếu có bất kỳ thắc mắc nào`,
          link: '/notification?tab=all',
          roles: [OperationType.MERCHANT_MANAGER],
        };
        break;
      case NOTIFICATION_TYPE.SUPER_ADMIN_ACTIVED:
        result = {
          title: 'Bạn đã được kích hoạt',
          description: `Quản trị viên hệ thống đã kích hoạt lại tài khoản ${username} của bạn, có địa chỉ ví ${walletAddress}.`,
          link: '/notification?tab=all',
          roles: [OperationType.SUPER_ADMIN],
        };
        break;
      case NOTIFICATION_TYPE.SELL_ORDER_HAS_TRANSACTION_UNKNOWN_ERROR_TO_ADMIN_SUPPORTER: 
        result = {
          title: 'Liên hệ từ người bán',
          description: `Gặp sự cố trong quá trình kiểm tra giao dịch ${amount} ${assetNetworks}, người bán ${username} đã liên hệ bạn trong giao dịch Bán ${transactionRefId}. Vui lòng kiểm tra và phản hồi.` ,
          link: '/admin-supporter/orders',
          roles: [OperationType.ADMIN_SUPPORTER],
        };
        break;
        case NOTIFICATION_TYPE.SELL_ORDER_HAS_TRANSACTION_UNKNOWN_ERROR_TO_OPERATOR: 
        result = {
          title: 'Liên hệ từ người bán',
          description: `Gặp sự cố trong quá trình kiểm tra giao dịch ${amount} ${assetNetworks}, người bán ${username} đã liên hệ bộ phận CSKH trong giao dịch Bán ${transactionRefId}. Vui lòng kiểm tra.` ,
          link: '/merchant/orders?status=pending-user-confirm',
          roles: [OperationType.MERCHANT_OPERATOR],
        };
        break;
      default:
        break;
    }

    return result;
  }
}
