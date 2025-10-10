import { env } from '@base/env';

export class OrderConfig {
  // flow BUY
  public userSendMinuteLimit: number;
  public userAppealSendingFiatLimit: number;
  public userAppealConfirmingFiatLimit: number;
  public userSentFiatLimit: number;
  public userRequestSupportLimit: number;

  // flow SELL
  public merchantSentFiatLimit: number;
  public userSendingCryptoLimit: number;

  constructor(userSendMinuteLimit: number) {
    this.userSendMinuteLimit = userSendMinuteLimit;
    this.userAppealSendingFiatLimit = Number(env.order.userSendingFiatLimit);
    this.userAppealConfirmingFiatLimit = Number(env.order.userConfirmingFiatLimit);
    this.userSentFiatLimit = Number(env.order.userSentFiatLimit);
    this.userRequestSupportLimit = Number(env.order.userRequestSupportLimit);

    this.merchantSentFiatLimit = Number(env.order.merchantSentFiatLimit);
    this.userSendingCryptoLimit = Number(env.order.userSendingCryptoLimit);
  }

  public getConfigSellOrder() {
    return {
      userSendMinuteLimit: this.userSendMinuteLimit,
      merchantSentFiatLimit: this.merchantSentFiatLimit,
      userSendingCryptoLimit: this.userSendingCryptoLimit,
    };
  }
}
