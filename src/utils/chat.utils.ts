import { env } from '@base/env';
import axios from 'axios';

const CHAT_ERROR_NAME = 'CHAT_ERROR';

export enum USER_TYPE {
  BOT = 'BOT',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum ParticipantRole {
  VIEWER = 'VIEWER',
  MEMBER = 'MEMBER',
  OWNER = 'OWNER',
}

export interface IChatResponse {
  data: {
    _id: string;
  };
}

export interface IBotSendMessage {
  roomId: string;
  msg: string;
}

export interface IParticipantRole {
  userId: string;
  role: ParticipantRole;
}

export interface ICreateChatRoom {
  name: string;
  participants: IParticipantRole[];
}

export interface IAddUserToChatRoom {
  roomId: string;
  participants: IParticipantRole[];
}

export interface ICloseChatRoom {
  roomId: string;
}

export const errorChatMessage = (error: any) => {
  const chatError = new Error();
  chatError.name = CHAT_ERROR_NAME;
  chatError.message = `${error?.response?.data?.statusCode || error?.statusCode}: ${
    error?.response?.data?.message || error?.message
  }`;
  chatError.stack = error?.stack;
  return chatError;
};

export function getChatApiHeader() {
  return {
    [env.chatService.prefixHeader]: `${env.chatService.apiKey}:${env.chatService.apiHash}`,
    'Content-Type': 'application/json',
  };
}

export const getChatApiUrl = {
  CREATE_ROOM: `${env.chatService.targetDomain}api/bot/rooms/create`,
  SEND_MESSAGE: `${env.chatService.targetDomain}api/bot/rooms/send-message`,
  GET_USER_CHAT_ID: `${env.chatService.targetDomain}api/bot/users/create`,
  CLOSE_ROOM: `${env.chatService.targetDomain}api/bot/rooms/close-room`,
  ADD_NEW_MEMBER: `${env.chatService.targetDomain}api/bot/rooms/add-chat`,
};

export async function getPeerChatId(type: USER_TYPE) {
  try {
    const url = getChatApiUrl.GET_USER_CHAT_ID;
    const response = await axios.post<IChatResponse>(url, { type }, { headers: getChatApiHeader() });
    return response?.data?.data?._id;
  } catch (err: any) {
    throw errorChatMessage(err);
  }
}

export async function botSendMessage(data: IBotSendMessage) {
  try {
    await axios.post(getChatApiUrl.SEND_MESSAGE, data, { headers: getChatApiHeader() });
    return true;
  } catch (err: any) {
    throw errorChatMessage(err);
  }
}

export async function createRoom(data: ICreateChatRoom) {
  try {
    const response = await axios.post<IChatResponse>(getChatApiUrl.CREATE_ROOM, data, {
      headers: getChatApiHeader(),
    });
    return response?.data?.data?._id;
  } catch (err: any) {
    throw errorChatMessage(err);
  }
}

export async function closeChatRoom(data: ICloseChatRoom) {
  try {
    const response = await axios.post<IChatResponse>(getChatApiUrl.CLOSE_ROOM, data, {
      headers: getChatApiHeader(),
    });
    return response?.data?.data?._id;
  } catch (err: any) {
    throw errorChatMessage(err);
  }
}

export async function addNewMember(data: IAddUserToChatRoom) {
  try {
    const response = await axios.post<IChatResponse>(getChatApiUrl.ADD_NEW_MEMBER, data, {
      headers: getChatApiHeader(),
    });
    return response?.data;
  } catch (err: any) {
    throw errorChatMessage(err);
  }
}

export async function createChatRoom(orderRefId: string, participants: IParticipantRole[]) {
  const title = `Khiếu nại [Giao dịch #${orderRefId}]`;
  return await createRoom({
    name: title,
    participants,
  });
}

export async function closeAppealMessage(roomId: string) {
  await closeChatRoom({ roomId });
  return true;
}
