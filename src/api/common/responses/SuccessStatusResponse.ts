import { EmptyResponse } from "./EmptyResponse";

export class SuccessStatusResponse extends EmptyResponse {
    public status = 1; // 1: success, 0: failed
    public msg = 'success';
}
