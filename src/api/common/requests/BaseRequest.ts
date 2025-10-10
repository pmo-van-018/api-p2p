import { IsNotEmpty, IsString, IsUUID, Length, Matches } from 'class-validator';

export class UUIDParamRequest {
  @IsNotEmpty()
  @IsUUID(4)
  public id: string;
}

export class RefIDParamRequest {
  @IsNotEmpty()
  @IsString()
  @Length(20, 20)
  @Matches(/^[0-9]*$/)
  public id: string;
}
