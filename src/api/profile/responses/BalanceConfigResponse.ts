class BalanceConfiguration {
  public assetId: string;
  public balance: number;

  constructor(balanceConfig: BalanceConfiguration) {
    this.assetId = balanceConfig.assetId;
    this.balance = Number(balanceConfig.balance);
  }
}

export class BalanceConfigResponse {
  public balanceConfigs: BalanceConfiguration[];

  constructor(balanceConfigs: BalanceConfiguration[]) {
    this.balanceConfigs = balanceConfigs.map((balanceConfig) => new BalanceConfiguration(balanceConfig));
  }
}
