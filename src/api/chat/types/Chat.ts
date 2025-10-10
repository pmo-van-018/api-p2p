export type ChatParticipant = {
  roomId: string;
  participants: Participant[];
};

export type Participant = {
  peerChatId: string;
  nickName: string;
  role?: string;
};
