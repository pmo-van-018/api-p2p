import { NextFunction, Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

import { HttpResponseError } from '@api/common/errors/HttpResponseError';
import { P2PError } from '@api/common/errors/P2PError';
import { P2PRequestErrors } from '@api/common/errors/P2PRequestErrors';
import { UserStatus, UserType } from '@api/common/models/P2PEnum';
import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { Operation } from '@api/profile/models/Operation';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';
import { BaseEntity } from 'typeorm';
import { formatErrorResponse } from '@base/utils/response.util';
import AuthenticationError from 'passport/lib/errors/authenticationerror'

@Service()
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  public isProduction = env.isProduction;
  constructor(@Logger(__filename) private log: LoggerInterface) {}

  public error(error: any, req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof AuthenticationError) {
      res.status(400).json(
        ServiceResult.fail({
          key: error.message,
          message: error.message,
        } as ErrorInfo)
      );
      return;
    }

    // TODO: cover api v1 (need remove when migrate to v2 completed)
    if (error instanceof P2PError) {
      res.status(this.getHttpStatusCodeFromErrorType(error.type)).json(
        ServiceResult.fail({
          key: error.key,
          message: error.message,
        } as ErrorInfo)
      );
      return;
    }
    let errorObject = HttpResponseError.INTERNAL_ERROR;

    if (error instanceof P2PRequestErrors) {
      const errorResponse = new ServiceResult(
        null,
        error.errors.map((fieldError) => ({
          key: fieldError.key,
          message: fieldError.message,
          type: HttpResponseError.INPUT_VALIDATE_ERROR.type,
          property: fieldError.property,
        }))
      );

      errorResponse.data = req['user'] && {
        user: this.getUserErrorResponse(req['user'] as any),
      };
      res.json(formatErrorResponse(errorResponse));
      return;
    }

    // Status code
    if (error instanceof HttpError && error.httpCode) {
      res.status(error.httpCode);
      errorObject = HttpResponseError.FORBIDDEN_ERROR;
    }
    // Class validator handle errors
    const classValidatorErrors: ErrorInfo[] = [];
    if (error.httpCode === 400) {
      if (
        typeof error === 'object' &&
        Object.prototype.hasOwnProperty.call(error, 'errors') &&
        Array.isArray(error?.errors)
      ) {
        error.errors.forEach((element: any) => {
          if (element.contexts?.isNotEmpty || element.constraints?.isNotEmpty) {
            classValidatorErrors.push({
              key: element.contexts?.isNotEmpty?.key || HttpResponseError.INPUT_VALIDATE_ERROR.key,
              message: element.contexts?.isNotEmpty?.message || element.constraints?.isNotEmpty?.message,
              type: HttpResponseError.INPUT_VALIDATE_ERROR.type,
              property: element.property,
            });
          } else if (element.contexts) {
            Object.keys(element.contexts).forEach((key) => {
              classValidatorErrors.push({
                key: element.contexts[key]?.key,
                message: element.contexts[key]?.message,
                type: element.contexts[key]?.type,
                property: element.property,
              });
            });
          } else if (element.property && element.constraints) {
            Object.keys(element.constraints).forEach((key) => {
              classValidatorErrors.push({
                key: HttpResponseError.INPUT_VALIDATE_ERROR.key,
                message: element.constraints[key]?.message,
                type: HttpResponseError.INPUT_VALIDATE_ERROR.type,
                property: element.property,
              });
            });
          } else if (element.children && Array.isArray(element.children) && element.children.length) {
            classValidatorErrors.push(...this.handleChildError(element.children));
          }
        });
      } else if (error.name === 'ParamNormalizationError') {
        classValidatorErrors.push(this.getErrorFromParamNormalizationError());
      }
      if (classValidatorErrors.length > 0) {
        res.status(412);
      }
    }

    if (!this.isProduction && error.status === 500) {
      errorObject.message = error.stack;
      errorObject.key = HttpResponseError.INTERNAL_ERROR.key;
    }

    const errors = classValidatorErrors.length ? classValidatorErrors : [errorObject];
    // Final response
    const errorResponse = new ServiceResult(null, errors);
    errorResponse.data = req['user'] && {
      user: this.getUserErrorResponse(req['user'] as any),
    };
    res.json(formatErrorResponse(errorResponse));

    if (this.isProduction) {
      this.log.error(error.name, error.message);
    } else {
      this.log.error(error.name, error.stack);
    }
  }

  private handleChildError(childrenError: any[]) {
    const classValidatorErrors: ErrorInfo[] = [];
    childrenError.forEach((element: any) => {
      if (element.children && Array.isArray(element.children) && element.children.length) {
        classValidatorErrors.push(...this.handleChildError(element.children));
      } else if (element.contexts?.isNotEmpty || element.constraints?.isNotEmpty) {
          classValidatorErrors.push({
            key: element.contexts?.isNotEmpty?.key || HttpResponseError.INPUT_VALIDATE_ERROR.key,
            message: element.contexts?.isNotEmpty?.message || element.constraints?.isNotEmpty?.message,
            type: HttpResponseError.INPUT_VALIDATE_ERROR.type,
            property: element.property,
          });
        } else if (element.contexts) {
          Object.keys(element.contexts).forEach((key) => {
            classValidatorErrors.push({
              key: element.contexts[key]?.key,
              message: element.contexts[key]?.message,
              type: element.contexts[key]?.type,
              property: element.property,
            });
          });
        } else if (element.property && element.constraints) {
          Object.keys(element.constraints).forEach((key) => {
            classValidatorErrors.push({
              key: HttpResponseError.INPUT_VALIDATE_ERROR.key,
              message: element.constraints[key]?.message,
              type: HttpResponseError.INPUT_VALIDATE_ERROR.type,
              property: element.property,
            });
          });
        }
      });
    return classValidatorErrors;
  }

  protected getUserErrorResponse(user: Operation): Partial<Omit<Operation, keyof BaseEntity | 'type' | 'status'>> & {
    type: string;
    status: string;
  } {
    return {
      id: user.id,
      walletAddress: user.walletAddress,
      type: UserType[user.type],
      nickName: user.nickName,
      status: UserStatus[user.status],
    };
  }

  // TODO: cover api v1 (need remove when migrate to v2 completed)
  protected getHttpStatusCodeFromErrorType(errorType: ErrorType) {
    switch (errorType) {
      case ErrorType.NOT_FOUND:
        return 404;
      case ErrorType.BAD_REQUEST:
        return 400;
      case ErrorType.FORBIDDEN:
        return 403;
      default:
        return 500;
    }
  }

  protected getErrorFromParamNormalizationError() {
    const errorObject = HttpResponseError.INPUT_VALIDATE_ERROR;
    return errorObject;
  }
}
