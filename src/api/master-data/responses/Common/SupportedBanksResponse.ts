import { SupportedBank } from '@api/common/models/P2PEnum';

export class SupportedBankResponse {
  public supportedBanks: SupportedBank[];

  constructor(supportedBanks: SupportedBank[]) {
    this.supportedBanks = supportedBanks;
  }
}
