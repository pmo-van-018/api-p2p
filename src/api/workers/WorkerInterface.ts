import { Observable } from 'rxjs';

export interface WorkerInterface {
  start(): Promise<Observable<any>>;
  stop(): Promise<Observable<any>>;
}
