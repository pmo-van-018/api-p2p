import { Fiat } from '@api/master-data/models/Fiat';

export class FiatResponse {
  public id: string;
  public symbol: string;
  public name: string;
  public logo: string;
  public precision: number;

  constructor(fiat: Fiat) {
    this.id = fiat.id;
    this.symbol = fiat.symbol;
    this.name = fiat.name;
    this.logo = fiat.logo;
    this.precision = fiat.precision;
  }
}
