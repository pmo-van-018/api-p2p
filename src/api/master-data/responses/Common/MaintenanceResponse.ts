import { SupportedWallet } from "@api/common/models/P2PEnum";

export class MaintenanceResponse {
  public assetMaintenance: string[];

  public walletMaintenance: SupportedWallet[];

  constructor(data: { assetMaintenance: string[], walletMaintenance: SupportedWallet[] }) {
    const { assetMaintenance, walletMaintenance } = data;
    this.assetMaintenance = assetMaintenance;
    this.walletMaintenance = walletMaintenance;
  }
}
