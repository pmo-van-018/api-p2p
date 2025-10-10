export abstract class BaseSyncService {
  abstract sync(): Promise<void>;
}
