import { ChatParticipant, Participant } from '@api/chat/types/Chat';

export class ParticipantsResponse {
  public roomId: string;
  public participants: Participant[];

  constructor(data: ChatParticipant) {
    this.roomId = data.roomId;
    this.participants = data.participants;
  }
}
