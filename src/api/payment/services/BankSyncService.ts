import { Service } from 'typedi';
import axios from 'axios';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { setCache, wrap } from '@base/utils/redis-client';
import { BankBOCResponse, BankBOCData } from '@api/payment/types/PaymentMethod';
import { env } from '@base/env';
import { getBankNameByCodeBOC } from '@base/utils/banks.utils'

const BANK_BOC_CACHE_KEY = 'banks-boc-supported';
const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

@Service()
export class BankSyncService {
  private bankBOCAgent: string;
  private bankBOCCurrency: string;

  constructor(@Logger(__filename) private log: LoggerInterface) {
    this.bankBOCAgent = env.payment.bankBOCAgent;
    this.bankBOCCurrency = env.payment.bankBOCCurrency;
  }

  public getBankBOCCacheKey(): string {
    return BANK_BOC_CACHE_KEY;
  }

  private async fetchBankDataFromAPI(): Promise<BankBOCData[]> {
    try {
      const bocUrl = new URL(`${env.boc.apiUrl}/transfer-brand/banks`);
      bocUrl.searchParams.set('agent', this.bankBOCAgent);
      bocUrl.searchParams.set('currency', this.bankBOCCurrency);
      const response = await axios.get<BankBOCResponse>(bocUrl.toString(), {
        timeout: 30000,
      });

      this.log.info(`Successfully fetched ${response.data.data.length} banks from external API`);
      return response.data.data;
    } catch (error) {
      this.log.error('Failed to fetch bank data from external API', error);
      throw error;
    }
  }

  private formatBankData(bankData: BankBOCData[]): BankBOCData[] {
    return bankData.map((bank) => {
      return {
          bank_code: bank.bank_code,
          bank_name: getBankNameByCodeBOC(bank.bank_code),
       }
    }) ?? [];
  }

  public async syncBankData(): Promise<BankBOCData[]> {
    try {
      this.log.info('Starting bank data synchronization...');
      const bankData = await this.fetchBankDataFromAPI();
      const bankCodeFormatted = this.formatBankData(bankData);
      await setCache(this.getBankBOCCacheKey(), bankCodeFormatted, CACHE_TTL);

      this.log.info(`Successfully cached ${bankCodeFormatted.length} banks with TTL ${CACHE_TTL}s`);
      return bankCodeFormatted;
    } catch (error) {
      this.log.error('Bank data synchronization failed', error);
      throw error;
    }
  }

  public async getBankData(): Promise<BankBOCData[]> {
    return await wrap(this.getBankBOCCacheKey(), () => this.syncBankData());
  }
}

