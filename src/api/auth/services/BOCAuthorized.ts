import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { UseBefore } from 'routing-controllers';
import { AuthenticateError } from '../errors/AuthenticateError';
import { BocRequestBodyDto } from '@api/order/requests/BocUpdateTicketRequest';
import { md5Hash } from '@base/utils/secure.util';
import { env } from '@base/env';

export function BOCAuthorized() {
  return UseBefore(async (req: any, res: any, next: any): Promise<boolean> => {
    const body: BocRequestBodyDto = req.body;
    if (!body || !body.agent || !body.token || !body.data?.ID) {
      return res.status(401).json(ServiceResult.fail(AuthenticateError.INVALID_CREDENTIALS));
      }
      if (body.token !== md5Hash(`${env.boc.agent}${env.boc.apiKey}${body.data.ID}`)) { 
        return res.status(401).json(ServiceResult.fail(AuthenticateError.INVALID_CREDENTIALS));
      }
    return next();
  });
}
