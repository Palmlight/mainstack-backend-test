export enum Currency {
  USD = 'USD',
  NGN = 'NGN',
}

export enum TransactionTypes {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface TransactionFilters {
  currency?: Currency;
  type?: TransactionTypes;
  status?: TransactionStatus;
}
