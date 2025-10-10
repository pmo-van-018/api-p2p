export enum SupportRequestQueryStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

export enum SupportRequestStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum SupportRequestType {
  ORDER = 1,
  TRANSACTION = 2,
  APPEAL = 3,
  REGISTRATION_MANAGER = 4,
  SYSTEM = 5,
  OTHER = 6,
}

export enum SupportRequestSearchType {
  REF_ID = 'REF_ID',
  NICK_NAME = 'NICK_NAME',
  ADMIN_NICK_NAME = 'ADMIN_NICK_NAME',
}

export enum SupportRequestSortField {
  CREATE_TIME = 'CREATE_TIME',
  COMPLETE_TIME = 'COMPLETE_TIME',
}
