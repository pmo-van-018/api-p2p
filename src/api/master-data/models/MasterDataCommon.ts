import { MASTER_DATA_COMMON_DEFAULT, MAX_MERCHANT_OPERATOR } from '@api/common/models/P2PConstant';
import { SupportedAsset, SupportedBank, SupportedWallet } from '@api/common/models/P2PEnum';
import { EntityBase } from '@api/infrastructure/abstracts/EntityBase';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'master_data_common' })
export class MasterDataCommon extends EntityBase {
  @Column({ name: 'supported_bank_list', type: 'simple-array', default: null, nullable: true })
  public supportedBanks: SupportedBank[];

  @Column({ name: 'merchant_to_user_time_buy_list', type: 'simple-array', default: null, nullable: true })
  public merchantToUserTimeBuys: number[];

  @Column({ name: 'merchant_to_user_time_sell_list', type: 'simple-array', default: null, nullable: true })
  public merchantToUserTimeSells: number[];

  @Column({ name: 'user_to_merchant_time_buy_list', type: 'simple-array', default: null, nullable: true })
  public userToMerchantTimeBuys: number[];

  @Column({ name: 'user_to_merchant_time_sell_list', type: 'simple-array', default: null, nullable: true })
  public userToMerchantTimeSells: number[];

  @Column({ name: 'asset_network_type_list', type: 'simple-array', default: null, nullable: true })
  public assetNetworkTypes: SupportedAsset[];

  @Column({ name: 'trading_rule_asset_type_list', type: 'simple-array', default: null, nullable: true })
  public tradingRuleAssetTypes: SupportedAsset[];

  @Column({
    name: 'min_order_limit',
    type: 'decimal',
    precision: 27,
    scale: 0,
    default: MASTER_DATA_COMMON_DEFAULT.MIN_ORDER_LIMIT,
  })
  public minOrderLimit: number;

  @Column({
    name: 'max_order_limit',
    type: 'decimal',
    precision: 27,
    scale: 0,
    default: MASTER_DATA_COMMON_DEFAULT.MAX_ORDER_LIMIT,
  })
  public maxOrderLimit: number;

  @Column({
    name: 'min_post_limit',
    type: 'decimal',
    precision: 27,
    scale: 0,
    default: MASTER_DATA_COMMON_DEFAULT.MIN_POST_LIMIT,
  })
  public minPostLimit: number;

  @Column({
    name: 'max_post_limit',
    type: 'decimal',
    precision: 27,
    scale: 0,
    default: MASTER_DATA_COMMON_DEFAULT.MAX_POST_LIMIT,
  })
  public maxPostLimit: number;

  @Column({ name: 'user_ask_merchant_time', default: MASTER_DATA_COMMON_DEFAULT.USER_ASK_MERCHANT_TIME })
  public userAskMerchantTime: number;

  @Column({ name: 'user_ask_cs_time', default: MASTER_DATA_COMMON_DEFAULT.USER_ASK_CS_TIME })
  public userAskCSTime: number;

  @Column({ name: 'merchant_to_user_time_sell', default: MASTER_DATA_COMMON_DEFAULT.MERCHANT_TO_USER_TIME_SELL })
  public merchantToUserTimeSell: number;

  @Column({ name: 'merchant_to_user_time_buy', default: MASTER_DATA_COMMON_DEFAULT.MERCHANT_TO_USER_TIME_BUY })
  public merchantToUserTimeBuy: number;

  @Column({
    name: 'fee',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: MASTER_DATA_COMMON_DEFAULT.FEE,
    transformer: {
      from: (value: any) => Number(value),
      to: (value: any) => value,
    },
  })
  public fee: number;

  @Column({
    name: 'penalty_fee',
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: MASTER_DATA_COMMON_DEFAULT.PENALTY_FEE,
    transformer: {
      from: (value: any) => Number(value),
      to: (value: any) => value,
    },
  })
  public penaltyFee: number;

  @Column({ name: 'max_merchant_operator', default: MAX_MERCHANT_OPERATOR })
  public maxMerchantOperator: number;

  @Column({ name: 'created_by_id', length: 36 })
  public createdById: string;

  @Column({ name: 'updated_by_id', nullable: true, length: 36 })
  public updatedById: string;

  @Column({ name: 'user_payment_methods_limit', default: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PAYMENT_METHOD })
  public userPaymentMethodsLimit: number;

  @Column({ name: 'manager_payment_methods_limit', default: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PAYMENT_METHOD })
  public managerPaymentMethodsLimit: number;

  @Column({ name: 'appeal_receive_by_supporter_limit', default: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_APPEAL })
  public appealReceivedBySupporterLimit: number;

  @Column({ name: 'appeal_receive_by_admin_supporter_limit', default: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_APPEAL })
  public appealReceivedByAdminSupporterLimit: number;

  @Column({ name: 'support_request_receiving_limit', default: MASTER_DATA_COMMON_DEFAULT.NUMBER_LIMIT_PICK_REQUEST })
  public supportRequestsReceivingLimit: number;

  @Column({ name: 'evidence_provision_time_limit', default: MASTER_DATA_COMMON_DEFAULT.APPEAL_EVIDENCE_TIME })
  public evidenceProvisionTimeLimit: number;

  @Column({ name: 'crypto_sending_wait_time_limit', default: MASTER_DATA_COMMON_DEFAULT.CRYPTO_TRANSACTION_TIME })
  public cryptoSendingWaitTimeLimit: number;

  @Column({ name: 'asset_maintenance', default: [], type: 'simple-array', nullable: true })
  public assetMaintenance: string[];

  @Column({ name: 'wallet_maintenance', default: [], type: 'simple-array', nullable: true })
  public walletMaintenance: SupportedWallet[];

  @Column({ name: 'metadata', type: 'json', nullable: true })
  public metadata: any;
}
