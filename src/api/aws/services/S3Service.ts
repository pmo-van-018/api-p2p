import Container, { Service } from 'typedi';
import { PutObjectCommand, PutObjectCommandInput, PutObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Readable } from 'stream';
import bytes from 'bytes';
import { env } from '@base/env';
import { CloudfrontService } from './CloudFrontService';
import { IAwsS3GetPreSignedUrlOptions, IAwsS3PutItemOptions } from '../interfaces/AwsInterface';

Service();
export class S3Service {
  private s3Client: S3Client;
  private bucket: string;

  private presignedUrlTtl: number;
  private maxFileSize: number;

  constructor(private cloudfrontService: CloudfrontService) {
    this.bucket = env.aws.s3.bucket;
    this.presignedUrlTtl = env.aws.s3.presignedUrlTtl;
    this.maxFileSize = bytes(env.aws.s3.maxFileSize);
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: env.aws.credential.key,
        secretAccessKey: env.aws.credential.secret,
      },
      region: env.aws.s3.region,
    });

    this.cloudfrontService = Container.get<CloudfrontService>(CloudfrontService)
  }

  async putItemInBucket(
    filename: string,
    content: string | Uint8Array | Buffer | Readable | ReadableStream | Blob,
    options?: IAwsS3PutItemOptions
  ): Promise<any> {
    let path: string = options?.path;
    const acl: string = options?.acl ? options.acl : 'public-read';

    if (path) {
      path = path.startsWith('/') ? path.replace('/', '') : `${path}`;
    }

    const mime: string = filename.substring(filename.lastIndexOf('.') + 1, filename.length).toUpperCase();
    const key: string = path ? `${path}/${filename}` : filename;
    const command: PutObjectCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: content,
      ACL: acl,
    });

    try {
      await this.s3Client.send<PutObjectCommandInput, PutObjectCommandOutput>(command);
    } catch (err: any) {
      throw err;
    }

    return {
      key,
      filename: '',
      completedUrl: this.getRedirectURL(key),
      mime,
    };
  }

  public async getPreSignedPostURL(filename: string, options?: IAwsS3GetPreSignedUrlOptions): Promise<any> {
    const rawFilename = options?.rawFilename ? options.rawFilename : filename;
    let path: string = options?.path;
    if (path) {
      path = path.startsWith('/') ? path.replace('/', '') : `${path}`;
    }
    const key: string = path ? `${path}/${filename}` : filename;
    const contentType = this.getContentType(rawFilename);
    const { url, fields } = await createPresignedPost(this.s3Client, {
      Bucket: this.bucket,
      Key: key,
      Conditions: [['content-length-range', 0, this.maxFileSize]],
      Fields: {
        success_action_status: '201',
        ...(contentType && { 'Content-Type': contentType }),
        'Content-Disposition': `attachment; filename=${rawFilename}`,
        // success_action_redirect: 'https://example.com/success',
        // complete list of fields: https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectPOST.html
      },
      Expires: this.presignedUrlTtl,
    });

    return {
      key,
      fields,
      preSingedUrl: url,
      redirectUrl: this.getRedirectURL(key),
    };
  }

  public getRedirectURL(key: string): string {
    return this.cloudfrontService.getRedirectURL(key);
  }

  public async getSignedCookie(key: string): Promise<any> {
    return this.cloudfrontService.getSignedCookie(key);
  }

  public getContentType(fileName: string): string {
    const fileExt = fileName.split('.').pop();
    return fileExt
      ? {
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
          gif: 'image/gif',
          pdf: 'application/pdf',
          doc: 'application/msword',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }[fileExt]
      : '';
  }
}
