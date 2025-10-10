import { env } from '@base/env';
import FormData from 'form-data';
import fetch from 'node-fetch';

export async function verifyCaptchaByCloudFlare(req: any, res: any, next: any) {
  if (!env.cf.enable) {
    return next();
  }

  if (env.cf.enable && (!env.cf.turnstile.secret_key || !req.body?.cfToken)) {
    return next(401);
  }

  try {
    const formData = new FormData();
    formData.append('secret', env.cf.turnstile.secret_key);
    formData.append('response', req.body?.cfToken);

    const cf_url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    const result = await fetch(cf_url, {
      body: formData,
      method: 'POST',
    });

    const comeOut = await result.json();

    next(comeOut.success ? undefined : 401);
  } catch (e) {
    return next(401);
  }
}
