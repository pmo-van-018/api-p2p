import { Fiat } from '../../../src/api/models/Fiat';

export const fiatData: Fiat[] = [];

export const mockFiat = () => {
  const fiat = new Fiat();
  fiat.id = fiatData.length + 1;
  fiat.name = 'VND';
  fiat.precision = 2;
  fiat.symbol = 'đ';
  fiatData.push(fiat);
  return fiat;
};
