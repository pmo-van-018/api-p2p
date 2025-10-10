export enum PaymentTicketStatus {
    NEW = 3,
    PICKED = 4,
    CANCEL = 5,
    COMPLETED = 6,
}

export enum PaymentTicketRequestType {
    CANCEL_TICKET = 1,
    CHECK_TICKET = 2,
}

export enum PaymentTicketType {
    WITHDRAW = 'withdraw',
}

export enum PaymentTicketCreditDrawBy {
    AUTO = 'auto',
}
