import { AdminAuthorized } from "@api/auth/services/AdminAuthorized";
import { ADMIN_ROLE_TYPE } from "@api/common/models";
import { ControllerBase } from "@api/infrastructure/abstracts/ControllerBase";
import { Body, JsonController, Params, Post } from "routing-controllers";
import { Response } from '@base/decorators/Response';
import { UpsertPublicViewAdjustmentUseCase } from "../usecase/UpsertPublicViewAdjustmentUseCase";
import { EmptyResponse } from "@api/common/responses/EmptyResponse";
import { CreatePublicViewAdjustmentRequest } from "../requests/CreatePublicViewAdjustmentRequest";
import { UUIDParamRequest } from "@api/common/requests/BaseRequest";

@JsonController('/public-view-adjustment')
@AdminAuthorized([ADMIN_ROLE_TYPE.SUPER_ADMIN])
export class ReporterStatisticController extends ControllerBase {
    constructor(
        private upsertPublicViewAdjustmentUseCase: UpsertPublicViewAdjustmentUseCase,
    ) {
        super();
    }

    @Post('/:id')
    @Response(EmptyResponse)
    public async upsertPublicViewAdjstment(
        @Body({ required: true }) createPublicViewAdjustmentRequest: CreatePublicViewAdjustmentRequest,
        @Params() params: UUIDParamRequest
    ) {
        return await this.upsertPublicViewAdjustmentUseCase.upsertPublicViewAdjstment(createPublicViewAdjustmentRequest, params.id);
    }
}
