export type PaymentTicketPayload = {
    note: string;
    balance: number;
    reciever: string;
    created_at: number;
    ID: string;
    type: string;
    bank_no: string;
    credit_draw_by: string;
    credit_draw_at: string;
    gateway: string;
    status: number;
};

export type PaymentTicketPayloadV2 = {
    id: string;
    status: string;
    amount: number;
    to_account_name: string;
    to_account_no: string;
    to_bank_code: string;
    brand_created_at: string;
    brand_note?: string;
    parent_id?: number;
    brand_approved_by?: string;
    brand_approved_at?: string;
    remitter_by?: string;
    remitter_at?: string;
    remitter_note?: string;
    from_bank_code?: string;
    from_account_unique_id?: string;
    from_account_eng_n?: string;
    to_account_unique_id?: string;
    brand_sender_fullname?: string;
    brand_trans_code?: string;
};

export type CreateTicketBodyRequest = {
    data: PaymentTicketPayloadV2;
    agent: string;
    token: string;
};

export type CancelTicketBodyRequest = {
    data: {
        id: string;
        user_request: string;
    };
    agent: string;
    request_type: number;
    token: string;
};


export type BaseTicketResponse = {
    success: boolean;
    message: string;
};

export type CancelTicketResponse = BaseTicketResponse

export type CreateTicketResponse = BaseTicketResponse & {
    transfer_code: string;
};
