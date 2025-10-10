import { env } from '@base/env';

export async function verifyApiKey(req: any, res: any, next: any) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === env.app.xApiKey) {
    next();
  } else {
    next(401);
  }
}
