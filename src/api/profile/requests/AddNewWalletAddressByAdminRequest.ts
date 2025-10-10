import { IsNotEmpty, IsUUID } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { AddNewWalletAddressRequest } from '@api/profile/requests/AddNewWalletAddressRequest';

export class AddNewWalletAddressByAdminRequest extends AddNewWalletAddressRequest {
    @IsNotEmpty()
    @IsUUID(4)
    @JSONSchema({ type: 'string', example: 'c1ef1228-6644-40a8-874c-e6221b9247d1' })
    public managerId: string;
}
