import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class ReferralCodeError {
    public static REFERRAL_CODE_NOT_FOUND: ErrorInfo = {
        key: 'REFERRAL_CODE_NOT_FOUND',
        message: 'Referral code not found',
        type: ErrorType.NOT_FOUND,
    };
    public static ALREADY_ENTERED_REFERRAL_CODE: ErrorInfo = {
        key: 'ALREADY_ENTERED_REFERRAL_CODE',
        message: 'You have already entered the referral code',
        type: ErrorType.BAD_REQUEST,
    };
    public static YOU_CANNOT_SUBMIT_YOUR_CODE: ErrorInfo = {
        key: 'YOU_CANNOT_SUBMIT_YOUR_CODE',
        message: 'You cannot submit your code',
        type: ErrorType.BAD_REQUEST,
    };
    public static ENTER_REFERRAL_CODE_FAIL: ErrorInfo = {
        key: 'ENTER_REFERRAL_CODE_FAIL',
        message: 'Enter referral code fail',
        type: ErrorType.BAD_REQUEST,
    };
    public static REFERRAL_CODE_INVALID: ErrorInfo = {
        key: 'REFERRAL_CODE_INVALID',
        message: 'Referral code invalid',
        type: ErrorType.BAD_REQUEST,
    };
    public static REFERRAL_CODE_MAX_LENGTH: ErrorInfo = {
        key: 'REFERRAL_CODE_MAX_LENGTH',
        message: 'Referral code max length',
        type: ErrorType.BAD_REQUEST,
    };
}
