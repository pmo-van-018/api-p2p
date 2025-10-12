
import { SupportedBank, BankCodeBOC } from '@api/common/models/P2PEnum';

export const getBankNameByCodeBOC = (bankCode: string): string => {
  const normalizedCode = bankCode.toLowerCase();

  const bocToSupportedBankMapping: Record<string, string> = {
    [BankCodeBOC.VIETCOMBANK]: SupportedBank.VIETCOMBANK,
    [BankCodeBOC.SEABANK]: SupportedBank.SEABANK,
    [BankCodeBOC.DONGABANK]: SupportedBank.DONGABANK,
    [BankCodeBOC.PGBANK]: SupportedBank.PGBANK,
    [BankCodeBOC.KIENLONGBANK]: SupportedBank.KIENLONGBANK,
    [BankCodeBOC.LIENVIETPOSTBANK]: SupportedBank.LIENVIETPOSTBANK,
  };
  if (bocToSupportedBankMapping[normalizedCode]) {
    return bocToSupportedBankMapping[normalizedCode];
  }

  const SUPPORTED_BANK_VALUES = new Set(Object.values(SupportedBank));

  if (SUPPORTED_BANK_VALUES.has(normalizedCode as SupportedBank)) {
    return normalizedCode;
  }

  return null;
}