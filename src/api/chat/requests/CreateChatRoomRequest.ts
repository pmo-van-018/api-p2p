import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateChatRoomRequest {
  @IsNotEmpty()
  @IsUUID(4)
  public orderId: string;
}
