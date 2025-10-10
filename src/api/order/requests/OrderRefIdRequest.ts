import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class OrderRefIdRequest {
    @IsNotEmpty()
    @IsString()
    @Length(20, 20)
    @Matches(/^[0-9]*$/)
    public orderId: string;
}
