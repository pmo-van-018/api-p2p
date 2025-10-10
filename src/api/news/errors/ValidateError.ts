import { ErrorInfo, ErrorType } from "@api/infrastructure/helpers/ErrorInfo";

export class ValidateError {
    public static CONTENT_IS_INVALID: ErrorInfo = {
        key: 'CONTENT_IS_INVALID',
        message: 'Content is invalid',
        type: ErrorType.BAD_REQUEST,
    };
    public static START_IS_INVALID: ErrorInfo = {
        key: 'START_IS_INVALID',
        message: 'Start is invalid',
        type: ErrorType.BAD_REQUEST,
    };
    public static END_IS_INVALID: ErrorInfo = {
        key: 'END_IS_INVALID',
        message: 'End is invalid',
        type: ErrorType.BAD_REQUEST,
    };
    public static NEWS_NOT_FOUND: ErrorInfo = {
        key: 'NEWS_NOT_FOUND',
        message: 'News not found',
        type: ErrorType.NOT_FOUND,
    };
}
