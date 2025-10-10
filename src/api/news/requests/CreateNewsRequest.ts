import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ValidateError } from '@api/news/errors/ValidateError';
import { IsAfterDate } from '@api/common/validations/IsAfterDate';

export class CreateNewsRequest {
    @IsNotEmpty({
        context: {
            key: ValidateError.CONTENT_IS_INVALID,
        },
    })
    @IsString({
        context: {
            key: ValidateError.CONTENT_IS_INVALID,
        },
    })
    public content: string;

    @IsNotEmpty({
        context: { key: ValidateError.START_IS_INVALID },
    })
    @IsDateString({}, {
        context: ValidateError.END_IS_INVALID,
    })
    public start: Date;

    @IsNotEmpty({
        context: { key: ValidateError.END_IS_INVALID },
    })
    @IsDateString({}, {
        context: ValidateError.END_IS_INVALID,
    })
    @IsAfterDate('start', {
        context: ValidateError.END_IS_INVALID,
    })
    public end: Date;
}
