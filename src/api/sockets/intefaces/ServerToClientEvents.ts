export interface ServerToClientEvents {
  inform: () => void;
  data: (jsonData: string) => void;
}
