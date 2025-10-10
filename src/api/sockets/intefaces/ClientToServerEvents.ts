export interface ClientToServerEvents {
  subscribeOrder: (orderId: string) => void;
  ping: () => void;
}
