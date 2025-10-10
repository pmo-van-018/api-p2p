import { Service } from 'typedi';
import AppRootPath from 'app-root-path';
import type { CloudfrontSignedCookiesOutput } from '@aws-sdk/cloudfront-signer';
import { getSignedCookies } from '@aws-sdk/cloudfront-signer';
import fs from 'fs';
import path from 'path';
import { env } from '@base/env';

@Service()
export class CloudfrontService {
  private domainDistribution: string;
  private privateKey: string;
  private keyPairId: string;
  private signedCookieTtl: number;

  constructor() {
    this.ensureHavePrivateKeyFile().then(() => {
      this.domainDistribution = env.aws.cloudfront.domainDistribution;
      this.keyPairId = env.aws.cloudfront.keyPairId;
      this.signedCookieTtl = env.aws.cloudfront.signedCookieTtl;
    });
  }

  public getSignedCookie(key: string): CloudfrontSignedCookiesOutput {
    const signedCookie = getSignedCookies({
      url: this.domainDistribution,
      privateKey: this.privateKey,
      keyPairId: this.keyPairId,
      policy: this.buildPolicy(key),
    });
    return signedCookie;
  }

  public getRedirectURL(key: string): string {
    return this.buildResourcePolicy(key);
  }

  private buildPolicy(key: string): string {
    // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-setting-signed-cookie-custom-policy.html
    const policy = JSON.stringify({
      Statement: [
        {
          Resource: this.buildResourcePolicy(key),
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': Math.floor(new Date().getTime() / 1000) + 60 * 60 * this.signedCookieTtl, // Current Time in UTC + time in seconds
            },
          },
        },
      ],
    });
    return policy;
  }

  private buildResourcePolicy(key: string): string {
    const uri = new URL(this.domainDistribution);
    uri.pathname = key;
    return uri.href;
  }

  private async ensureHavePrivateKeyFile(): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const privateKeyFilename = env.aws.cloudfront.privateKeyFilename || 'aws-cloudfront-private-key.pem';
      const privateKeyPath = path.resolve(AppRootPath.path, privateKeyFilename);

      if (fs.existsSync(privateKeyPath)) {
        this.privateKey = fs.readFileSync(privateKeyPath, { encoding: 'utf8' });
        return resolve();
      }

      this.privateKey = privateKeyFilename;
      fs.writeFileSync(privateKeyPath, this.privateKey);

      return resolve();
    });
  }
}
