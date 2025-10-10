import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ValidateError {
  public static BANK_NUMBER_REQUIRED: ErrorInfo = {
    key: 'REQUIRED',
    message: 'Bank number is required',
    type: ErrorType.BAD_REQUEST,
    property: 'bankNumber',
  };
  public static BANK_NUMBER_MIN_LENGTH: ErrorInfo = {
    key: 'MIN_LENGTH',
    message: 'Bank number min length is 3 characters.',
    type: ErrorType.BAD_REQUEST,
    property: 'bankNumber',
  };
  public static BANK_NUMBER_MAX_LENGTH: ErrorInfo = {
    key: 'MAX_LENGTH',
    message: 'Bank number max length is 20 characters.',
    type: ErrorType.BAD_REQUEST,
    property: 'bankNumber',
  };
  public static BANK_NUMBER_ALPHA_NUMERIC: ErrorInfo = {
    key: 'ALPHA_NUMERIC',
    message: 'Bank number must be only character in A-Z, a-z and 0-9.',
    type: ErrorType.BAD_REQUEST,
    property: 'bankNumber',
  };
  public static BANK_NAME_REQUIRED: ErrorInfo = {
    key: 'REQUIRED',
    message: 'Bank name is required',
    type: ErrorType.BAD_REQUEST,
    property: 'bankName',
  };
  public static BANK_NAME_INVALID: ErrorInfo = {
    key: 'INVALID',
    message: 'Bank name is invalid',
    type: ErrorType.BAD_REQUEST,
    property: 'bankName',
  };
  public static BANK_HOLDER_REQUIRED: ErrorInfo = {
    key: 'REQUIRED',
    message: 'Bank holder is required',
    type: ErrorType.BAD_REQUEST,
    property: 'bankHolder',
  };
  public static BANK_HOLDER_MAX_LENGTH: ErrorInfo = {
    key: 'MAX_LENGTH',
    message: 'Bank holder max length is 32 characters.',
    type: ErrorType.BAD_REQUEST,
    property: 'bankHolder',
  };
  public static BANK_HOLDER_ALPHA: ErrorInfo = {
    key: 'ALPHA',
    message: 'Bank holder must be only character in A-Z, a-z.',
    type: ErrorType.BAD_REQUEST,
    property: 'bankHolder',
  };
  public static BANK_REMARK_MAX_LENGTH: ErrorInfo = {
    key: 'MAX_LENGTH',
    message: 'Bank remark max length is 32 characters.',
    type: ErrorType.BAD_REQUEST,
    property: 'bankRemark',
  };
  public static BANK_REMARK_VI_ALPHA_NUMERIC_SPACES: ErrorInfo = {
    key: 'VI_ALPHA_NUMERIC_SPACES',
    message: 'Bank remark must be only character in A-Z, a-z, 0-9 and Vietnamese.',
    type: ErrorType.BAD_REQUEST,
    property: 'bankRemark',
  };
  public static PAYMENT_METHOD_ID_REQUIRED: ErrorInfo = {
    key: 'REQUIRED',
    message: 'Payment method identity is required.',
    type: ErrorType.BAD_REQUEST,
    property: 'id',
  };
  public static PAYMENT_METHOD_ID_INVALID: ErrorInfo = {
    key: 'INVALID',
    message: 'Payment method identity is invalid.',
    type: ErrorType.BAD_REQUEST,
    property: 'id',
  };
}
