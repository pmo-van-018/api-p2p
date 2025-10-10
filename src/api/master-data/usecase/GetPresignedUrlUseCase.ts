import { Service } from 'typedi';
import uid from 'uid-safe';

import { S3Service } from '@api/aws/services/S3Service';
import { Operation } from '@api/profile/models/Operation';
import { GetPresignedUrlRequest } from '../requests/Common/GetPresignUrlRequest';

@Service()
export class GetPresignedUrlUseCase {
  private uploadPath: string;

  constructor(private s3Service: S3Service) {
    this.uploadPath = '/public/assets/images';
  }

  public async getPresignedUrl(_: Operation, data: GetPresignedUrlRequest) {
    const path = this.createPhotoFilename(data.fileName);
    const preSigned = await this.s3Service.getPreSignedPostURL(`${path.filename}`, {
      path: `${path.path}`,
      rawFilename: data.fileName,
    });

    return preSigned;
  }

  public createPhotoFilename(filename?: string): Record<string, any> {
    return {
      path: this.uploadPath,
      filename: uid.sync(24) + (filename ? filename : ''),
    };
  }
}
