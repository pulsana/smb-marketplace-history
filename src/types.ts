export enum TxStatus {
  FAILURE = 'FAILURE',
  SUCCESS = 'SUCCESS',
}

export enum TxType {
  DELISTING = 'DELISTING',
  LISTING = 'LISTING',
  SALE = 'SALE',
  UNKNOWN = 'UNKNOWN',
}

export interface Tx {
  hash: string;
  type: TxType;
  status: TxStatus;
  blockTime: Date;
}
