import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { fetchBankCodes } from '@base/utils/bank-qr.utils';

export const bankCodeLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
  fetchBankCodes();
};
