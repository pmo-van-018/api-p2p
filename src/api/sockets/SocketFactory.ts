import { Server, Socket } from 'socket.io';
import { Inject, Service } from 'typedi';

import { ClientToServerEvents } from '@api/sockets/intefaces/ClientToServerEvents';
import { ServerToClientEvents } from '@api/sockets/intefaces/ServerToClientEvents';
import { SocketData } from '@api/sockets/intefaces/SocketData';
import redisClient from '@base/utils/redis-client';
import { toStatusKey } from '@base/utils/redis-key';
import { KEEP_SOCKET_ONLINE_TTL } from '@api/constant/TimeToLive';

@Service()
export class SocketFactory {
  constructor(@Inject('io') private io: Server<ClientToServerEvents, ServerToClientEvents, null, SocketData>) {}
  public onConnect(socket: Socket<ClientToServerEvents, ServerToClientEvents, null, SocketData>) {
    if (socket.request?.session?.passport?.user) {
      const room = socket.request?.session?.passport?.user.walletAddress;
      const userId = socket.request?.session?.passport?.user.id;
      socket.join(room);
      socket.emit('inform');
      redisClient.set(toStatusKey(userId), 'online', 'EX', KEEP_SOCKET_ONLINE_TTL);
      socket.on('ping', () => {
        redisClient.set(toStatusKey(userId), 'online', 'EX', KEEP_SOCKET_ONLINE_TTL);
      });
    }
  }

  public emitAll(data: object) {
    this.io.emit('data', JSON.stringify(data));
  }

  public emitToRoom(room: string[] | string, data: object) {
    this.io.to(room).emit('data', JSON.stringify(data));
  }
}
