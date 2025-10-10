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

export type CreateTicketBodyRequest = {
    data: PaymentTicketPayload;
    agent: string;
    token: string;
};

export type CancelTicketBodyRequest = {
    data: {
        ID: string;
        user_request: string;
    };
    agent: string;
    request_type: number;
};