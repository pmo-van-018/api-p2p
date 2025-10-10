import { VietQR } from 'vietqr';
import { env } from '@base/env';
import { BankGenQrCodeParams } from '@api/payment/types/PaymentMethod';

let bankCodes = [];
const vietQR = new VietQR({
  clientID: env.vietQr.clientId,
  apiKey: env.vietQr.apiKey,
});

export async function fetchBankCodes() {
  try {
    const banks = await vietQR.getBanks();
    bankCodes = banks.data?.map((e) => ({
      code: e.bin,
      name: e.shortName,
    }));
  } catch (e) {
    console.error(e);
  }
}

export function getQrcodeUrl(bankParams: BankGenQrCodeParams) {
  const bankCode = bankCodes?.find((e) => e.name?.toLowerCase() === bankParams.name?.toLowerCase());
  return bankCode
    ? `${env.vietQr.url}/${bankCode.code}-${bankParams.number}-${env.vietQr.template || 'qr_only'}.png?amount=${
        bankParams.amount
      }&addInfo=${bankParams.note}`
    : '';
}

const banksMapping = [
  {
    value: 'VCB',
    bankName: 'vietcombank',
  },
  {
    value: 'VietinBank',
    bankName: 'vietinbank',
  },
  {
    value: 'Techcombank',
    bankName: 'techcombank',
  },
  {
    value: 'MBbank',
    bankName: 'mbbank',
  },
  {
    value: 'VPbank',
    bankName: 'vpbank',
  },
  {
    value: 'ACB',
    bankName: 'acb',
  },
  {
    value: 'BIDV',
    bankName: 'bidv',
  },
  {
    value: 'TPbank',
    bankName: 'tpbank',
  },
  {
    value: 'VIBbank',
    bankName: 'vib',
  },
  {
    value: 'Agribank',
    bankName: 'agribank',
  },
  {
    value: 'HDBank',
    bankName: 'hdbank',
  },
  {
    value: 'Sacombank',
    bankName: 'sacombank',
  },
  {
    value: 'SHB',
    bankName: 'shb',
  },
  {
    value: 'OCB',
    bankName: 'ocb',
  },
  {
    value: 'Maritimebank',
    bankName: 'msb',
  },
  {
    value: 'ABbank',
    bankName: 'abbank',
  },
  {
    value: 'BacABank',
    bankName: 'bacabank',
  },
  {
    value: 'DongA',
    bankName: 'dongabank',
  },
  {
    value: 'Eximbank',
    bankName: 'eximbank',
  },
  {
    value: 'GPB',
    bankName: 'gpbank',
  },
  {
    value: 'NamABank',
    bankName: 'namabank',
  },
  {
    value: 'NCB',
    bankName: 'ncb',
  },
  {
    value: 'PGB',
    bankName: 'pgbank',
  },
  {
    value: 'PVcombank',
    bankName: 'pvcombank',
  },
  {
    value: 'SGB',
    bankName: 'saigonbank',
  },
  {
    value: 'SCB',
    bankName: 'scb',
  },
  {
    value: 'SEAB',
    bankName: 'seabank',
  },
  {
    value: 'VAB',
    bankName: 'vietabank',
  },
  {
    value: 'Vietbank',
    bankName: 'vietbank',
  },
  {
    value: 'VietCapital',
    bankName: 'vietcapitalbank',
  },
  {
    value: 'KLB',
    bankName: 'kienlongbank',
  },
  {
    value: 'LPB',
    bankName: 'lienvietpostbank',
  },
];

export function getGateway(name: string) {
  const bank = banksMapping.find((e) => e.bankName === name);
  return bank?.value;
}
