import { ObjectCannedACL } from '@aws-sdk/client-s3';

export interface IAwsS3PutItemOptions {
  path: string;
  acl?: ObjectCannedACL;
}

export interface IAwsS3PostItemOptions {
  path: string;
}

export interface IAwsS3GetPreSignedUrlOptions {
  path: string;
  rawFilename?: string;
}
