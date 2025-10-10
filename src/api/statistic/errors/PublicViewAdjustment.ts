import { ErrorInfo, ErrorType } from '@api/infrastructure/helpers/ErrorInfo';

export class PublicViewAdjustmentError {
    public static MANAGER_NOT_FOUND: ErrorInfo = {
        key: 'MANAGER_NOT_FOUND',
        message: 'Manager not found',
        type: ErrorType.NOT_FOUND,
    };
    public static ASSET_NOT_FOUND: ErrorInfo = {
        key: 'ASSET_NOT_FOUND',
        message: 'Asset not found',
        type: ErrorType.NOT_FOUND,
    };
    public static PUBLIC_VIEW_ADJUSTMENT_NOT_FOUND: ErrorInfo = {
        key: 'PUBLIC_VIEW_ADJUSTMENT_NOT_FOUND',
        message: 'Public view adjustment not found',
        type: ErrorType.NOT_FOUND,
    };
}

