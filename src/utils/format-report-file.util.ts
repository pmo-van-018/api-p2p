import {
  OperationType,
  PostStatus,
  PostStatusReport,
  TradeType,
  TradeTypeCSV,
  UserStatus,
  UserType
} from '@api/common/models';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { ServiceOrderHelper } from '@api/infrastructure/helpers/ServiceOrder';
import moment from 'moment';
import { env } from '@base/env';
import BigNumber from 'bignumber.js';
import { reverseTradeType } from '@base/utils/helper.utils';
import { isEmpty } from 'lodash';

export function getOrderHistoryHeaderInfo(type: OperationType | UserType) {
  let merchantNickName = 'Tên thương gia';
  let merchantWallet = 'Địa chỉ ví (Thương gia)';
  const fiatColumnName = 'Tỷ giá (VND)';
  if (type === OperationType.MERCHANT_MANAGER) {
    merchantNickName = 'Tên giao dịch viên';
    merchantWallet = 'Địa chỉ ví (Giao dịch viên)';
  }
  const headers = [
    'STT',
    'Mã lệnh',
    'Mã quảng cáo',
    'Loại giao dịch',
    'Loại tiền mã hóa',
    'Loại mạng',
    'Loại tiền pháp định',
    'Số tiền pháp định (VND)',
    fiatColumnName,
    'Số lượng tiền mã hóa',
    'Nội dung chuyển khoản',
    merchantNickName,
    merchantWallet,
    'Tên người dùng',
    'Địa chỉ ví (Người dùng)',
    'TxID',
    'Trạng thái',
    'Khiếu nại',
    'Người thắng kiện',
    'Ngày tạo',
    'Tạo lúc',
    'Ngày hoàn thành',
    'Hoàn thành lúc',
  ];
  const nickNameColumnIndex = headers.indexOf(merchantNickName);
  const merchantWalletColumnIndex = headers.indexOf(merchantWallet);
  if (type === OperationType.MERCHANT_OPERATOR) {
    headers.splice(merchantWalletColumnIndex, 1);
    headers.splice(nickNameColumnIndex, 1);
  }
  const fiatColumnIndex = headers.indexOf(fiatColumnName);
  if (type !== UserType.USER) {
    headers.splice(nickNameColumnIndex, 0, 'Phí phạt (VND)');
    headers.splice(nickNameColumnIndex, 0, 'Phí giao dịch (VND)');
    headers.splice(fiatColumnIndex, 0, 'Tỷ lệ điều chỉnh giá (%)');
    headers.splice(fiatColumnIndex, 0, 'Tỷ giá Binance');
    headers.push('Thông tin chuyển khoản');
  }
  if (type === OperationType.SUPER_ADMIN) {
    headers.push('Thanh toán tạm');
  }
  return {
    headers,
    nickNameColumnIndex,
    fiatColumnIndex,
    merchantWalletColumnIndex,
  };
}

export function getPostHistoryHeader(type: OperationType) {
  if (type === OperationType.SUPER_ADMIN) {
    return [
      'STT',
      'Mã quảng cáo',
      'Thương gia',
      'Địa chỉ ví (Thương gia)',
      'Trạng thái',
      'Loại quảng cáo',
      'Loại tiền mã hóa',
      'Loại mạng',
      'Tỷ giá',
      'Giới hạn lệnh tối thiểu (VND)',
      'Giới hạn lệnh tối đa (VND)',
      'Số lượng đã giao dịch (Crypto)',
      'Phí giao dịch (VND)',
      'Phí phạt (VND)',
      'Số giao dịch hoàn thành',
      'Số giao dịch bị hủy',
      'Số giao dịch có khiếu nại',
      'Ngày tạo',
      'Ngày đóng',
    ];
  }
  return [
    'STT',
    'Mã quảng cáo',
    'Trạng thái',
    'Loại quảng cáo',
    'Loại tiền mã hóa',
    'Loại mạng',
    'Số lượng khả dụng (Crypto)',
    'Tỷ giá (VND)',
    'Số lượng đã giao dịch (Crypto)',
    'Tỉ lệ hoàn thành (%)',
    'Giới hạn lệnh tối thiểu (VND)',
    'Giới hạn lệnh tối đa (VND)',
    'Phí giao dịch (VND)',
    'Phí phạt (VND)',
    'Số giao dịch hoàn thành',
    'Số giao dịch bị hủy',
    'Số giao dịch có khiếu nại',
    'Ngày tạo',
    'Ngày đóng',
  ];
}

export function getAssetReportHeader() {
  return [
    'STT',
    'Loại tài sản',
    'Tổng số giao dịch',
    'Tổng khối lượng giao dịch (VND)',
    'Tổng phí giao dịch (VND)',
    'Tổng phí phạt (VND)',
    'Số giao dịch Mua',
    'Khối lượng Mua (VND)',
    'Số giao dịch Bán',
    'Khối lượng Bán (VND)',
    'Tỷ lệ giao dịch (%)',
  ];
}

export function getRevenueReportHeader() {
  return [
    'STT',
    'Thương gia',
    'Địa chỉ ví',
    'Giao dịch hoàn thành',
    'Giao dịch bị hủy',
    'Giao dịch có khiếu nại',
    'Tổng phí giao dịch',
    'Tổng phí phạt',
    'Tổng doanh thu',
  ];
}

export function getTradeTypeDifferenceReportHeader() {
  return [
    'STT',
    'Loại tài sản',
    'Loại giao dịch',
    'Số giao dịch',
    'Số lượng Crypto đã giao dịch',
    'Khối lượng tiền pháp định đã giao dịch (VND)',
    'Tỷ lệ Mua & Bán (%)',
  ];
}

export function getManagerStatisticReportHeader() {
  return [
    'STT',
    'Địa chỉ ví',
    'Tên thương gia',
    'Tổng số nhân viên',
    'Tổng số quảng cáo đã đăng',
    'Quảng cáo trực tuyến',
    'Tổng giao dịch',
    'Số lượng giao dịch thành công',
    'Tỷ lệ giao dịch thành công (%)',
    'Số lượng giao dịch có khiếu nại',
    'Tỷ lệ giao dịch có khiếu nại (%)',
    'Khối lượng giao dịch (VND)',
    'Tổng phí giao dịch (VND)',
    'Tổng phí phạt (VND)',
    'Đăng nhập gần nhất',
    'Trạng thái hoạt động',
    'Ngày bắt đầu hợp đồng',
    'Thời gian tạo',
    'Thời gian cập nhật',
  ];
}

export function getStaffStatisticReportHeader(isOperator: boolean) {
  if (isOperator) {
    return [
      'STT',
      'Địa chỉ ví',
      'Tên nhân viên',
      'Tổng số giao dịch',
      'Số giao dịch Mua hoàn tất',
      'Số giao dịch Bán hoàn tất',
      'Tổng số giao dịch thành công',
      'Tổng số giao dịch bị hủy',
      'Tổng số giao dịch có khiếu nại',
      'Tỷ lệ giao dịch thành công (%)',
      'Tổng số quảng cáo (Mua)',
      'Tổng số quảng cáo (Bán)',
      'Khối lượng giao dịch (VND)',
      'Tổng phí giao dịch (VND)',
      'Tổng phí phạt (VND)',
      'Trạng thái hoạt động',
      'Đăng nhập gần nhất',
      'Thời gian tạo',
      'Thời gian cập nhật',
    ];
  }
  return [
    'STT',
    'Địa chỉ ví',
    'Tên nhân viên',
    'Tổng số giao dịch có thỏa thuận/ khiếu nại',
    'Tổng số giao dịch đã nhận hỗ trợ',
    'Tổng số giao dịch thắng kiện',
    'Tổng số giao dịch thua kiện',
    'Tỷ lệ nhận hỗ trợ (%)',
    'Trạng thái hoạt động',
    'Đăng nhập gần nhất',
    'Thời gian tạo',
    'Thời gian cập nhật',
  ];
}

export function formatOrderHistoryReport(
  stt: number,
  row: any,
  type: OperationType | UserType,
  nickNameColumnIndex: number,
  merchantWalletColumnIndex: number,
  fiatColumnIndex: number
) {
  const managerWallet =
    type === OperationType.MERCHANT_MANAGER
      ? row.merchant_wallet_address
      : row.merchantManager_wallet_address;
  const isDeleted =
    type === OperationType.MERCHANT_MANAGER
      ? row.merchant_deleted_at
      : row.merchantManager_deleted_at;
  const nickName =
    type === OperationType.MERCHANT_MANAGER
      ? row.merchant_nick_name
      : row.merchantManager_nick_name;
  const managerNickName = `${nickName}${isDeleted ? ' (Đã xóa)' : ''}`;
  const content = [
    stt++,
    row.order_ref_id,
    row.post_ref_id,
    formatTradeTypeByRole(type, row.order_type),
    row.asset_name || '',
    row.asset_network || '',
    row.fiat_name || '',
    Helper.formatDecimal(row.order_total_price?.toString(), 2),
    Helper.formatDecimal(row.order_price?.toString(), 2),
    Helper.formatDecimal(row.order_amount?.toString(), 2),
    row.order_trans_code || '',
    managerNickName,
    managerWallet,
    row.user_nick_name,
    row.user_wallet_address,
    row.txid,
    ServiceOrderHelper.getOrderStatusState(row.order_status),
    row.appeal_id && row.appeal_admin_id ? 'Có' : 'Không',
    ServiceOrderHelper.getAppealWinner(row),
    moment(row.order_created_time).utcOffset(env.app.timeZone).format('DD-MM-YYYY'),
    moment(row.order_created_time).utcOffset(env.app.timeZone).format('HH:mm:ss'),
    moment(row.order_completed_time).utcOffset(env.app.timeZone).format('DD-MM-YYYY'),
    moment(row.order_completed_time).utcOffset(env.app.timeZone).format('HH:mm:ss'),
  ];
  if (type === OperationType.MERCHANT_OPERATOR) {
    content.splice(merchantWalletColumnIndex, 1);
    content.splice(nickNameColumnIndex, 1);
  }
  if (type !== UserType.USER) {
    content.splice(nickNameColumnIndex, 0, Helper.formatDecimal(row.order_total_penalty_fee?.toString(), 2));
    content.splice(nickNameColumnIndex, 0, Helper.formatDecimal(row.order_total_fee?.toString(), 2));
    content.splice(fiatColumnIndex, 0, Number(row.order_benchmark_percent));
    content.splice(fiatColumnIndex, 0, Number(row.order_benchmark_price));
    const paymentInfo = !isEmpty(row.order_payment_info) ? `${row.order_payment_info?.bankName || ''} - ${row.order_payment_info?.bankAccountName || ''} - ${row.order_payment_info?.bankAccountNumber || ''}` : '';
    content.push(paymentInfo);
  }
  if (type === OperationType.SUPER_ADMIN) {
    content.push(row.order_is_payment_from_another_account ? 'Có' : 'Không');
  }
  return content;
}

export function formatPostHistoryReport(stt: number, type: OperationType, row: any) {
  row.post_closed_at =
    row.post_status === PostStatus.CLOSE ? moment(row.post_updated_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY') : null;
  row.post_status = PostStatusReport[row.post_status];
  row.post_type = TradeTypeCSV[row.post_type];
  row.post_available_amount = Helper.formatDecimal(row.post_available_amount?.toString(), 2);
  row.post_real_price = Helper.formatDecimal(row.post_real_price?.toString(), 2);
  row.post_finished_amount = Helper.formatDecimal(row.post_finished_amount?.toString(), 2);
  row.post_complete_percent = new BigNumber(
    Helper.computePercentCalculation(Number(row.post_finished_amount), Number(row.post_available_amount))
  ).multipliedBy(100);
  row.post_min_order_amount = Helper.formatDecimal(row.post_min_order_amount?.toString(), 2);
  row.post_max_order_amount = Helper.formatDecimal(row.post_max_order_amount?.toString(), 2);
  row.post_total_fee = Helper.formatDecimal(row.post_total_fee?.toString(), 2);
  row.post_total_penalty_fee = Helper.formatDecimal(row.post_total_penalty_fee?.toString(), 2);
  row.od_completed = row.od_completed || 0;
  row.od_cancelled = row.od_cancelled || 0;
  row.od_appeal = row.od_appeal || 0;
  row.post_created_at = moment(row.post_created_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY');
  if (type === OperationType.SUPER_ADMIN) {
    return [
      stt,
      row.post_ref_id,
      `${row.merchantManager_nick_name}${row.merchantManager_deleted_at ? ' (Đã xóa)' : ''}`,
      row.merchantManager_wallet_address,
      row.post_status,
      row.post_type,
      row.asset_name,
      row.asset_network,
      row.post_real_price,
      row.post_min_order_amount,
      row.post_max_order_amount,
      row.post_finished_amount,
      row.post_total_fee,
      row.post_total_penalty_fee,
      row.od_completed,
      row.od_cancelled,
      row.od_appeal,
      row.post_created_at,
      row.post_closed_at,
    ];
  }
  return [
    stt,
    row.post_ref_id,
    row.post_status,
    row.post_type,
    row.asset_name,
    row.asset_network,
    row.post_available_amount,
    row.post_real_price,
    row.post_finished_amount,
    row.post_complete_percent,
    row.post_min_order_amount,
    row.post_max_order_amount,
    row.post_total_fee,
    row.post_total_penalty_fee,
    row.od_completed,
    row.od_cancelled,
    row.od_appeal,
    row.post_created_at,
    row.post_closed_at,
  ];
}

export function formatAssetRevenueReport(stt: number, row: any, totalAmount: any) {
  return [
    stt,
    `${row.assets_name} ( ${row.assets_network} )`,
    Number(row.total_order || 0),
    Number(row.total_price || 0),
    Number(row.total_fee || 0),
    Number(row.total_penalty_fee || 0),
    Number(row.total_buy || 0),
    Number(row.total_price_buy || 0),
    Number(row.total_sell || 0),
    Number(row.total_price_sell || 0),
    new BigNumber(
      Helper.computePercentCalculation(Number(row.total_price), Number(totalAmount.total_amount))
    ).multipliedBy(100).toNumber(),
  ];
}

export function formatTradeTypeDifferenceReport(stt: number, row: any, totalAssets: any, userType: number) {
  const assetIdType = row?.assets_id_type?.split('|');
  const assetId = assetIdType[0];
  const assetType = assetIdType[1];
  const totalAsset = totalAssets?.find((e) => e.asset_id === assetId);
  const percent = new BigNumber(
    Helper.computePercentCalculation(Number(row.total_price), Number(totalAsset?.total_amount || 0))
  ).multipliedBy(100);
  const content = [
    stt++,
    `${row.assets_name} ( ${row.assets_network} )`,
    assetType === reverseTradeType(TradeType.BUY, userType) ? 'Mua' : 'Bán',
    row.total_order || 0,
    Number(row.total_amount || 0),
    Number(row.total_price || 0),
    Number(percent) === 100 ? '--' : Number(percent),
  ];
  return content;
}

export function formatRevenueReport(stt: number, row: any) {
  return [
    stt++,
    `${row.nick_name}${row.deleted_at ? ' (Đã xóa)' : ''}`,
    row.wallet_address,
    Number(row.number_transaction_success),
    Number(row.number_transaction_cancelled),
    Number(row.number_transaction_appeal),
    Helper.formatDecimal(row.total_fee || '0', 2),
    Helper.formatDecimal(row.total_penalty_fee || '0', 2),
    Helper.plus(Number(row.total_fee), Number(row.total_penalty_fee)),
  ];
}

export function formatManagerStatisticReport(stt: number, row: any) {
  return [
    stt++,
    row.wallet_address,
    `${row.nick_name}${row.deleted_at ? ' (Đã xóa)' : ''}`,
    row.staff_total,
    row.post_total,
    row.post_online_total,
    row.order_total || 0,
    row.order_completed_total || 0,
    new BigNumber(
      Helper.computePercentCalculation(Number(row.order_completed_total), Number(row.order_total))
    ).multipliedBy(100).toNumber(),
    row.order_appeal_total || 0,
    new BigNumber(
      Helper.computePercentCalculation(Number(row.order_appeal_total), Number(row.order_total))
    ).multipliedBy(100).toNumber(),
    Helper.formatDecimal(row.total_price || '0', 2),
    Helper.formatDecimal(row.total_fee || '0', 2),
    Helper.formatDecimal(row.total_penalty_fee || '0', 2),
    moment(row.last_login_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss'),
    row.status === UserStatus.ACTIVE ? 'Đang hoạt động' : 'Không hoạt động',
    moment(row.contract_from).utcOffset(env.app.timeZone).format('DD-MM-YYYY'),
    moment(row.created_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss'),
    moment(row.updated_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss'),
  ];
}

export function formatSupporterStatisticReport(stt: number, row: any, orderTotal: any) {
  return [
    stt++,
    row.wallet_address,
    `${row.nick_name}${row.deleted_at ? ' (Đã xóa)' : ''}`,
    orderTotal.order_total || 0,
    row.oder_received_total || 0,
    row.oder_win_total || 0,
    row.oder_lose_total || 0,
    new BigNumber(
      Helper.computePercentCalculation(
        Number(row.oder_received_total) || 0,
        Number(orderTotal.order_total) || 0
      )
    ).multipliedBy(100),
    row.status === UserStatus.ACTIVE ? 'Đang hoạt động' : 'Không hoạt động',
    row.last_login_at
      ? moment(row.last_login_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss')
      : 'Chưa đăng nhập',
    moment(row.created_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss'),
    moment(row.updated_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss'),
  ];
}

export function formatOperatorStatisticReport(stt: number, row: any) {
  return [
    stt++,
    row.wallet_address,
    `${row.nick_name}${row.deleted_at ? ' (Đã xóa)' : ''}`,
    row.order_total || 0,
    row.order_buy_completed_total || 0,
    row.order_sell_completed_total || 0,
    row.order_completed_total || 0,
    row.order_cancelled_total || 0,
    row.order_appeal_total || 0,
    new BigNumber(
      Helper.computePercentCalculation(Number(row.order_completed_total), Number(row.order_total))
    ).multipliedBy(100).toNumber(),
    row.post_buy_total || 0,
    row.post_sell_total || 0,
    Helper.formatDecimal(row.total_price || '0', 2),
    Helper.formatDecimal(row.total_fee || '0', 2),
    Helper.formatDecimal(row.total_penalty_fee || '0', 2),
    row.status === UserStatus.ACTIVE ? 'Đang hoạt động' : 'Không hoạt động',
    row.last_login_at
      ? moment(row.last_login_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss')
      : 'Chưa đăng nhập',
    moment(row.created_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss'),
    moment(row.updated_at).utcOffset(env.app.timeZone).format('DD-MM-YYYY HH:mm:ss'),
  ];
}

function formatTradeTypeByRole(type: OperationType | UserType, tradeType: string): string {
  const reverseTypeRoles: number[] = [OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER];
  if (reverseTypeRoles.includes(type)) {
    return tradeType === TradeType.BUY ? TradeTypeCSV.SELL : TradeTypeCSV.BUY;
  }
  return TradeTypeCSV[tradeType];
}
