import { EmptyResponse } from "./EmptyResponse";

export class SuccessStatusResponse extends EmptyResponse {
    public status = 1;
    public msg = 'success';
}
